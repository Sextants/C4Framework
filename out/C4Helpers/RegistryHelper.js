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
const c4eurekaclient_1 = require("c4eurekaclient");
const c4utils_1 = require("c4utils");
/**
 * 向Eureka服务进行注册
 * 注册时会将自身的LoadBalance信息写入到Metadata中
 * 默认为ConsistentHash，权重为1
 * TODO:Java端框架也应写入该值
 * @param c4 C4Framewrok
 */
function RegistryHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug('RegistryHelper in');
        if (null === c4.getConfigger()) {
            c4.getLogger().err("Registry service, configger is not init.");
            return false;
        }
        let EurekaServerConfig = C4Framework_1.default.getConfig()["EurekaServer"];
        let EurekaClientConfig = C4Framework_1.default.getConfig()["EurekaClient"];
        /**
         * TODO: 处理metadata中LoadBalance部分，需要转换成JSON串
         */
        if (EurekaServerConfig && EurekaClientConfig) {
            // check
            // process load balance
            if (EurekaClientConfig.metadata) {
                let metadata = EurekaClientConfig.metadata;
                let defaultLB = JSON.stringify([{
                        LBType: 'ConsistentHash',
                        Weight: 1
                    }]);
                if (c4utils_1.TypeUtils.isString(metadata.loadBalance)) {
                    let IsRef = metadata.loadBalance.match(/^{LoadBalance}$/g);
                    if (IsRef === null) {
                        // 尝试下是否是一个JSON字符串
                        try {
                            if (!c4utils_1.TypeUtils.isArray(JSON.parse(metadata.loadBalance))) {
                                metadata.loadBalance = defaultLB;
                                c4.getLogger().warn("RegistryHelper use default load balance config.");
                            }
                        }
                        catch (error) {
                            metadata.loadBalance = defaultLB;
                            c4.getLogger().warn("RegistryHelper use default load balance config.");
                        }
                    }
                    else {
                        try {
                            metadata.loadBalance = JSON.stringify(C4Framework_1.default.getConfig()["LoadBalance"]);
                        }
                        catch (error) {
                            c4.getLogger().err(error);
                            metadata.loadBalance = defaultLB;
                        }
                    }
                }
                else if (c4utils_1.TypeUtils.isArray(metadata.loadBalance)) {
                    metadata.loadBalance = JSON.stringify(metadata.loadBalance);
                }
                else {
                    metadata.loadBalance = defaultLB;
                    c4.getLogger().warn("RegistryHelper use default load balance config.");
                }
            }
            EurekaClientConfig.port = {
                "$": EurekaClientConfig.port,
                "@enabled": true
            };
            EurekaClientConfig.dataCenterInfo = {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                name: EurekaClientConfig.dataCenterInfo
            };
            let EurekaClient = new c4eurekaclient_1.C4EurekaClient();
            EurekaClient.init(EurekaServerConfig, EurekaClientConfig);
            yield EurekaClient.start();
            c4.setRegistryClient(EurekaClient);
        }
        c4.getLogger().debug('RegistryHelper init finish.');
        return true;
    });
}
exports.default = RegistryHelper;
//# sourceMappingURL=RegistryHelper.js.map