"use strict";
/**
 * TODO:
 * 用来等待依赖的服务
 * 配置依赖服务的负载均衡（通过服务名可以直接调用接口，内部实现调用具体实例）
 * 用来初始化依赖服务的RESTFul API调用接口
 * 用来初始化依赖服务的MQ API调用接口？
 */
// 用来等待依赖的服务
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
const c4utils_1 = require("c4utils");
const c4apisclient_1 = require("c4apisclient");
const c4loadbalancer_1 = require("c4loadbalancer");
const c4utils_2 = require("c4utils");
const APIDir = ['./APIs', './out/APIs'];
// function LoadAPIsClient(name : string) {
//     if (!TypeUtils.isString(name)
//         || TypeUtils.isEmptyStr(name)) {
//         return undefined;
//     }
//     if (glob.hasMagic(name))
//         return undefined;
//     let parsedFile  = Path.parse(name);
//     let curPath     = Path.join(parsedFile.dir, parsedFile.name);
//     let fullPath    = Path.join(process.cwd(), APIDir, curPath + '.*');
//     let IsInside    = PathUtils.PathInside(process.cwd(), fullPath);
//     if (!IsInside) {
//         return undefined;
//     }
//     return FSP.getModules([fullPath], "", false)[0];
// }
/**
 * 获取依赖服务的信息，并加载对应的API Client
 * @param c4 C4Framework
 */
function DependenciesHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * TODO: 增加对应的校验schema配置
         */
        // check
        c4.getLogger().debug('DependenciesHelper in');
        let dependencies = C4Framework_1.default.getConfig()["Dependencies"];
        if (dependencies && dependencies.apps) {
            if (!c4utils_1.TypeUtils.isArray(dependencies.apps) || dependencies.apps.length === 0) {
                return true;
            }
            let CurDependencies = c4.getDependencies();
            for (let i = 0; i < dependencies.apps.length; i++) {
                let CurDependency = dependencies.apps[i];
                // 初始化Load balancer
                let CurDS = new c4apisclient_1.C4DependencyService(CurDependency.appName, CurDependency.timeout, CurDependency.required);
                let CurLB = c4loadbalancer_1.C4LoadBalancer.createBalancer(CurDependency.LBType);
                if (null === CurLB) {
                    c4.getLogger().err(`Create load balancer ${CurDependency.LBType} failed.`);
                    throw new Error(`Create load balancer ${CurDependency.LBType} failed.`);
                }
                CurDS.setLoadBalancer(CurDependency.LBType, CurLB);
                // 初始化APIs Client
                // let CurAPIsTarget = LoadAPIsClient(CurDependency.APIs);
                let tempTargets = c4utils_2.FSP.getModulesEx(CurDependency.APIs, APIDir, '', true);
                if (c4utils_1.TypeUtils.isEmptyArray(tempTargets)) {
                    c4.getLogger().err(`Can't load ${CurDependency.APIs}.`);
                    throw new Error(`Can't load ${CurDependency.APIs}.`);
                }
                let CurAPIsTarget = tempTargets[0];
                if (CurAPIsTarget === undefined) {
                    c4.getLogger().err(`Can't load ${CurDependency.APIs}.`);
                    throw new Error(`Can't load ${CurDependency.APIs}.`);
                }
                let CurAPIsClient = (new CurAPIsTarget());
                CurDS.setAPIsClient(CurAPIsClient, c4.getRESTClient());
                CurDependencies.set(CurDependency.AppName, CurDS);
            }
        }
        c4.getLogger().debug('DependenciesHelper init finish.');
        return true;
    });
}
exports.default = DependenciesHelper;
//# sourceMappingURL=DependenciesHelper.js.map