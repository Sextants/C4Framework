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
const c4webservice_1 = require("c4webservice");
const c4utils_1 = require("c4utils");
function ProcessSessionConfig(SessionConfig, c4) {
    if (c4utils_1.TypeUtils.isEmptyObj(SessionConfig)) {
        return;
    }
    if (SessionConfig.type === "redis") {
        if (!c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store)
            && !c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store.client)
            && c4utils_1.TypeUtils.isString(SessionConfig.store.client)) {
            let IsClientRef = SessionConfig.store.client.match(/^{Redis:[\S\s]+}$/g);
            if (IsClientRef === null) {
                c4.getLogger().err('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but client format error. Cur store client config is : %s.', SessionConfig.store.client);
                throw new Error('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but client format error. Cur store client config is : ' + SessionConfig.store.client + '.');
            }
            // 获取Redis Client
            let CurRedisClientName = SessionConfig.store.client.replace(/^{Redis:[\s]*/g, '').replace(/[\s]*}$/g, '');
            let CurRedisClient = c4.getRedisClient(CurRedisClientName);
            if (c4utils_1.TypeUtils.isEmptyObj(CurRedisClient)) {
                c4.getLogger().err('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but can\'t find client. Cur store client config is : %s.', SessionConfig.store.client);
                throw new Error('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but can\'t find client. Cur store client config is : ' + SessionConfig.store.client + '.');
            }
            // 删除连接配置
            delete SessionConfig.store.host;
            delete SessionConfig.store.port;
            delete SessionConfig.store.pass;
        }
        else if (!c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store)
            && !c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store.host)
            && !c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store.port)
            && !c4utils_1.TypeUtils.isEmptyObj(SessionConfig.store.db)) {
            delete SessionConfig.store.client;
        }
    }
}
/**
 * 初始化Web Service
 * 应当初始化一个获取当前服务状态的服务
 * 然后再根据配置初始化其他业务相关的服务
 * @param c4 C4Framework
 */
function WebServiceHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        // init status service
        c4.getLogger().debug('WebServiceHelper in');
        let CurWebServices = c4.getWebServices();
        let CurConfig = C4Framework_1.default.getConfig();
        if (!CurWebServices.has("StatusService")) {
            c4.getLogger().debug('WebServiceHelper init Status Service.');
            let CurAppInfo = c4.getAppInfo();
            let StatusConfig = CurConfig.StatusService;
            if (c4utils_1.TypeUtils.isEmptyObj(StatusConfig)) {
                StatusConfig = {
                    name: "StatusService",
                    host: CurAppInfo.Host || CurConfig.EurekaClient.ipAddr || 'localhost',
                    port: CurAppInfo.Port || CurConfig.EurekaClient.port["$"] || 9001,
                    serviceType: "http",
                    logger: c4.getLogger()
                };
            }
            else {
                // 合并下配置
                StatusConfig = Object.assign({
                    name: "StatusService",
                    host: CurAppInfo.Host || CurConfig.EurekaClient.ipAddr || 'localhost',
                    port: CurAppInfo.Port || CurConfig.EurekaClient.port["$"] || 9001,
                    serviceType: "http",
                    logger: c4.getLogger()
                }, StatusConfig);
            }
            // 处理一下Session的配置
            ProcessSessionConfig(StatusConfig.Session, c4);
            c4.getLogger().debug('WebServiceHelper Status Config : %s.', JSON.stringify(StatusConfig, null, 4));
            let CurStatusService = new c4webservice_1.C4WebService();
            yield CurStatusService.init(StatusConfig).catch((err) => {
                c4.getLogger().err(err);
                return false;
            });
            // 添加默认的Controller --> StatusController
            yield CurStatusService.addControllers(["StatusController"]);
            if (StatusConfig.controllers) {
                // 添加其他的Controllers
                yield CurStatusService.addControllers(StatusConfig.controllers);
            }
            CurWebServices.set("StatusService", CurStatusService);
            yield CurStatusService.launch().catch((err) => {
                c4.getLogger().err(err);
            });
            c4.getLogger().debug('WebServiceHelper init Status Service finished.');
        }
        // init other webservice
        c4.getLogger().debug('WebServiceHelper init Web Services.');
        try {
            c4.getLogger().debug('WebServiceHelper Web Services configs : %s.', JSON.stringify(CurConfig.WebServices, null, 4));
            for (let i = 0; i < CurConfig.WebServices.length; i++) {
                let CurWebConfig = CurConfig.WebServices[i];
                CurWebConfig.logger = c4.getLogger();
                if (!CurWebServices.has(CurWebConfig.name)) {
                    // 处理一下Session的配置
                    ProcessSessionConfig(CurWebConfig.Session, c4);
                    let CurService = new c4webservice_1.C4WebService();
                    let Res = yield CurService.init(CurWebConfig).catch((err) => {
                        c4.getLogger().err("Init Web Service %s failed.", CurWebConfig.name);
                        c4.getLogger().err(err);
                        return false;
                    });
                    if (Res === false) {
                        continue;
                    }
                    // bind controller
                    // 创建Controller时ACL已经提交资源矩阵
                    CurService.addControllers(CurWebConfig.controllers);
                    Res = yield CurService.launch().catch((err) => {
                        c4.getLogger().err("Launch Web Service %s failed.", CurWebConfig.name);
                        c4.getLogger().err(err);
                        return false;
                    });
                    if (Res === false) {
                        continue;
                    }
                    CurWebServices.set(CurWebConfig.name, CurService);
                }
                else {
                    c4.getLogger().warn('Web Service %s exist.', CurWebConfig.name);
                }
            }
        }
        catch (error) {
            c4.getLogger().err(error);
        }
        c4.getLogger().debug('WebServiceHelper init Web Services finished.');
        return true;
    });
}
exports.default = WebServiceHelper;
//# sourceMappingURL=WebServiceHelper.js.map