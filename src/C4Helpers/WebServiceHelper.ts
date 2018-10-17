
import C4Framework      from '../C4Framework';
import { C4WebService } from 'c4webservice';
import { C4Logger }     from 'c4logger';
import { TypeUtils }    from 'c4utils';

interface RedisStoreOptions {
    host : string;
    port : number;

}

function ProcessSessionConfig(SessionConfig : any, c4 : C4Framework) {
    if (TypeUtils.isEmptyObj(SessionConfig)) {
        return;
    }

    if (SessionConfig.type === "redis") {
        if (!TypeUtils.isEmptyObj(SessionConfig.store)
            && !TypeUtils.isEmptyObj(SessionConfig.store.client)
            && TypeUtils.isString(SessionConfig.store.client)) {
            let IsClientRef = SessionConfig.store.client.match(/^{Redis:[\S\s]+}$/g);
            if (IsClientRef === null) {
                (<C4Logger>c4.getLogger()).err('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but client format error. Cur store client config is : %s.', SessionConfig.store.client);
                throw new Error('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but client format error. Cur store client config is : ' + SessionConfig.store.client + '.');
            }

            // 获取Redis Client
            let CurRedisClientName  = SessionConfig.store.client.replace(/^{Redis:[\s]*/g, '').replace(/[\s]*}$/g, '');
            let CurRedisClient      = c4.getRedisClient(CurRedisClientName);
            if (TypeUtils.isEmptyObj(CurRedisClient)) {
                (<C4Logger>c4.getLogger()).err('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but can\'t find client. Cur store client config is : %s.', SessionConfig.store.client);
                throw new Error('ProcessSessionConfig failed, Session store type is "Redis", '
                    + 'but can\'t find client. Cur store client config is : ' + SessionConfig.store.client + '.');
            }

            // 删除连接配置
            delete SessionConfig.store.host;
            delete SessionConfig.store.port;
            delete SessionConfig.store.pass;
        } else if (!TypeUtils.isEmptyObj(SessionConfig.store)
            && !TypeUtils.isEmptyObj(SessionConfig.store.host)
            && !TypeUtils.isEmptyObj(SessionConfig.store.port)
            && !TypeUtils.isEmptyObj(SessionConfig.store.db)) {
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
export default async function WebServiceHelper(c4 : C4Framework) {
    // init status service
    (<C4Logger>c4.getLogger()).debug('WebServiceHelper in');
    let CurWebServices  = c4.getWebServices();
    let CurConfig       = C4Framework.getConfig();
    if (!CurWebServices.has("StatusService")) {
        (<C4Logger>c4.getLogger()).debug('WebServiceHelper init Status Service.');
        let CurAppInfo          = c4.getAppInfo();
        let StatusConfig        = CurConfig.StatusService;
        if (TypeUtils.isEmptyObj(StatusConfig)) {
            StatusConfig = {
                name : "StatusService",
                host : CurAppInfo.Host || CurConfig.EurekaClient.ipAddr || 'localhost',
                port : CurAppInfo.Port || CurConfig.EurekaClient.port["$"] || 9001,
                serviceType : "http",
                logger : c4.getLogger()
            };
        } else {
            // 合并下配置
            StatusConfig = Object.assign({
                name : "StatusService",
                host : CurAppInfo.Host || CurConfig.EurekaClient.ipAddr || 'localhost',
                port : CurAppInfo.Port || CurConfig.EurekaClient.port["$"] || 9001,
                serviceType : "http",
                logger : c4.getLogger()
            }, StatusConfig);
        }

        // 处理一下Session的配置
        ProcessSessionConfig(StatusConfig.Session, c4);

        (<C4Logger>c4.getLogger()).debug('WebServiceHelper Status Config : %s.', JSON.stringify(StatusConfig, null, 4));

        let CurStatusService    = new C4WebService();
        await CurStatusService.init(StatusConfig).catch((err) => {
            (<C4Logger>c4.getLogger()).err(err);
            return false;
        });

        // 添加默认的Controller --> StatusController
        await CurStatusService.addControllers(["StatusController"]);
        if (StatusConfig.controllers) {
            // 添加其他的Controllers
            await CurStatusService.addControllers(StatusConfig.controllers);
        }
        CurWebServices.set("StatusService", CurStatusService);
        await CurStatusService.launch().catch((err) => {
            (<C4Logger>c4.getLogger()).err(err);
        });
        (<C4Logger>c4.getLogger()).debug('WebServiceHelper init Status Service finished.');
    }

    // init other webservice
    (<C4Logger>c4.getLogger()).debug('WebServiceHelper init Web Services.');
    try {
        (<C4Logger>c4.getLogger()).debug('WebServiceHelper Web Services configs : %s.', JSON.stringify(CurConfig.WebServices, null, 4));
        for (let i = 0; i < CurConfig.WebServices.length; i++) {
            let CurWebConfig = CurConfig.WebServices[i];
            CurWebConfig.logger = c4.getLogger();
            if (!CurWebServices.has(CurWebConfig.name)) {
                // 处理一下Session的配置
                ProcessSessionConfig(CurWebConfig.Session, c4);
                let CurService = new C4WebService();
                let Res = await CurService.init(CurWebConfig).catch((err) => {
                    (<C4Logger>c4.getLogger()).err("Init Web Service %s failed.", CurWebConfig.name);
                    (<C4Logger>c4.getLogger()).err(err);
                    return false;
                });
                if (Res === false) {
                    continue;
                }
                // bind controller
                // 创建Controller时ACL已经提交资源矩阵
                CurService.addControllers(CurWebConfig.controllers);

                Res = await CurService.launch().catch((err) => {
                    (<C4Logger>c4.getLogger()).err("Launch Web Service %s failed.", CurWebConfig.name);
                    (<C4Logger>c4.getLogger()).err(err);
                    return false;
                });
                if (Res === false) {
                    continue;
                }
                CurWebServices.set(CurWebConfig.name, CurService);
            } else {
                (<C4Logger>c4.getLogger()).warn('Web Service %s exist.', CurWebConfig.name);
            }
        }
    } catch (error) {
        (<C4Logger>c4.getLogger()).err(error);
    }
    (<C4Logger>c4.getLogger()).debug('WebServiceHelper init Web Services finished.');
    return true;
}
