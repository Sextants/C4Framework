
import C4Framewrok from '../C4Framework';
import { C4Logger } from 'c4logger';
import { C4EurekaClient } from 'c4eurekaclient';
import { TypeUtils } from 'c4utils';

/**
 * 向Eureka服务进行注册
 * 注册时会将自身的LoadBalance信息写入到Metadata中
 * 默认为ConsistentHash，权重为1
 * TODO:Java端框架也应写入该值
 * @param c4 C4Framewrok
 */
export default async function RegistryHelper(c4 : C4Framewrok) {
    (<C4Logger>c4.getLogger()).debug('RegistryHelper in');
    if (null === c4.getConfigger()) {
        (<C4Logger>c4.getLogger()).err("Registry service, configger is not init.");
        return false;
    }

    let EurekaServerConfig  = C4Framewrok.getConfig()["EurekaServer"];
    let EurekaClientConfig  = C4Framewrok.getConfig()["EurekaClient"];
    /**
     * TODO: 处理metadata中LoadBalance部分，需要转换成JSON串
     */
    if (EurekaServerConfig && EurekaClientConfig) {
        // check

        // process load balance
        if (EurekaClientConfig.metadata) {
            let metadata = EurekaClientConfig.metadata;
            let defaultLB = JSON.stringify([{
                LBType : 'ConsistentHash',
                Weight : 1
            }]);
            if (TypeUtils.isString(metadata.loadBalance)) {
                let IsRef = metadata.loadBalance.match(/^{LoadBalance}$/g);
                if (IsRef === null) {
                    // 尝试下是否是一个JSON字符串
                    try {
                        if (!TypeUtils.isArray(JSON.parse(metadata.loadBalance))) {
                            metadata.loadBalance = defaultLB;
                            (<C4Logger>c4.getLogger()).warn("RegistryHelper use default load balance config.")
                        }
                    } catch (error) {
                        metadata.loadBalance = defaultLB;
                        (<C4Logger>c4.getLogger()).warn("RegistryHelper use default load balance config.")
                    }
                } else {
                    try {
                        metadata.loadBalance = JSON.stringify(C4Framewrok.getConfig()["LoadBalance"]);
                    } catch (error) {
                        (<C4Logger>c4.getLogger()).err(error);
                        metadata.loadBalance = defaultLB;
                    }
                }
            } else if (TypeUtils.isArray(metadata.loadBalance)) {
                metadata.loadBalance = JSON.stringify(metadata.loadBalance);
            } else {
                metadata.loadBalance = defaultLB;
                (<C4Logger>c4.getLogger()).warn("RegistryHelper use default load balance config.")
            }
        }

        EurekaClientConfig.port = {
            "$" : EurekaClientConfig.port,
            "@enabled" : true
        };
        EurekaClientConfig.dataCenterInfo = {
            "@class" : "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
            name : EurekaClientConfig.dataCenterInfo
        };

        let EurekaClient = new C4EurekaClient();
        EurekaClient.init(EurekaServerConfig, EurekaClientConfig);
        await EurekaClient.start();

        c4.setRegistryClient(EurekaClient);
    }

    (<C4Logger>c4.getLogger()).debug('RegistryHelper init finish.');

    return true;
}
