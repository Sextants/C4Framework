"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const C4Framework_1 = require("../C4Framework");
const AppInfoUtils_1 = require("../C4FrameworkUtils/AppInfoUtils");
const C4ApplicationInfo_1 = require("../C4FrameworkTypes/C4ApplicationInfo");
/**
 * 更新所有依赖的服务状态的任务
 * @param c4
 * @param interval 任务间隔时间
 */
function UpdateDependenciesTask(c4, interval) {
    return __awaiter(this, void 0, void 0, function* () {
        let CurDependencies = c4.getDependencies();
        let CurEurekaClient = c4.getRegistryClient();
        let UpdateTasks = [];
        for (let temp of CurDependencies) {
            let CurAppName = temp[0];
            let CurDS = temp[1];
            let CurInstancesInfo = CurEurekaClient.getInstancesByAppId(CurAppName);
            UpdateTasks.push(CurDS.updateInstance(CurInstancesInfo));
        }
        let UpdateRes = yield Promise.all(UpdateTasks);
        let AllReady = true;
        let i = 0;
        for (let service of CurDependencies.values()) {
            if (service.isRequired()
                && UpdateRes[i] !== true) {
                AllReady = false;
                break;
            }
            i++;
        }
        if (AllReady !== true) {
            C4ApplicationInfo_1.ServiceStatus.Status = "Initializing";
        }
        /**
         * TODO: 发现有依赖的服务没有可用的实例的时候，
         * 需要根据依赖的服务的required的标志来控制当前服务的状态
         * 若required状态为true，则将当前服务状态由Ready、Starting和Running标记为Initializing
         * 并记录日志；
         * 若required状态为false，则不更新状态，并记录日志
         *
         * 把服务依赖项信息也写入metadata中，然后写一个工具，对依赖项进行分析，标记其中是否有环
         * 绝对不允许循环依赖存在（存在循环依赖，需要引入一个协调的Gateway来解依赖）
         */
        setTimeout(() => {
            UpdateDependenciesTask(c4, interval);
        }, interval);
    });
}
/**
 * 等待依赖的服务状态变更为ready
 * @param c4 C4Framework
 */
function WaitDependenciesHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug('WaitDependenciesHelper in');
        /**
         * TODO: 增加对应的校验schema配置
         */
        // Check
        let RegistryClient = c4.getRegistryClient();
        if (RegistryClient) {
            let CurDependencies = c4.getDependencies();
            let DSArray = [];
            for (let key of CurDependencies.keys()) {
                DSArray.push(key);
            }
            // 等待所有依赖服务注册完毕
            yield RegistryClient.waitRegistered(DSArray);
            // 等待所有依赖服务状态变为ready（至少一个实例的状态变更为ready）
            let Temps = [];
            for (let temp of CurDependencies) {
                Temps.push(temp[1]);
            }
            /**
             * 不是required true的可以放行
             */
            do {
                let WaitTask = [];
                for (let i = 0; i < Temps.length; i++) {
                    let CurDS = Temps[i];
                    WaitTask.push(CurDS.updateInstance(RegistryClient).getInstancesByAppId(CurDS.getAppName()));
                }
                // 等待所有页面ready
                let Temps2 = [];
                let TaskRes = yield Promise.all(WaitTask);
                for (let i = 0; i < TaskRes.length; i++) {
                    if (TaskRes[i] === false) {
                        // 没有更新，required是true
                        if (Temps[i].isRequired())
                            Temps2.push(Temps[i]);
                    }
                }
                if (Temps2.length === 0) {
                    break;
                }
                Temps = Temps2;
                // 不要一直占用CPU
                AppInfoUtils_1.Sleep(3000);
            } while (true);
            // 启动定时更新依赖服务的Instance
            let dependencies = C4Framework_1.default.getConfig()["Dependencies"];
            if (dependencies) {
                let updateInterval = dependencies.updateInterval;
                setTimeout(() => {
                    UpdateDependenciesTask(c4, updateInterval);
                }, updateInterval);
            }
        }
        // 状态变更为Ready
        C4ApplicationInfo_1.ServiceStatus.Status = "Ready";
        c4.getLogger().debug('WaitDependenciesHelper init finish.');
        return true;
    });
}
exports.default = WaitDependenciesHelper;
//# sourceMappingURL=WaitDependenciesHelper.js.map