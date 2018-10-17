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
const c4utils_1 = require("c4utils");
const c4_mq_1 = require("c4-mq");
/**
 * 初始化MQ、Publisher和Subscriber
 * 对于标记了subscribeLater的Subscriber会在DelaySubscribeHelper中进行订阅
 * @param c4 C4Framework
 */
function MQHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        // 可以有多个连接
        // 可以有多个Publisher和Subscriber
        // 都有名字，通过名字标记
        // 可以通过名字获取实例
        c4.getLogger().debug("MQHelper in");
        let CurConnections = c4.getMQConnections();
        let CurPublishers = c4.getPublishers();
        let CurSubscribers = c4.getSubscribers();
        let SubscribeLater = c4.getSubscribeLater();
        let CurConfig = C4Framework_1.default.getConfig();
        if (c4utils_1.TypeUtils.isEmptyObj(CurConfig.MQClients)) {
            c4.getLogger().debug("MQHelper no handler init.");
            return true;
        }
        let ConnectionsConfig = CurConfig.MQClients.connections;
        let PublishersConfig = CurConfig.MQClients.publishers;
        let SubscribersConfig = CurConfig.MQClients.subscribers;
        c4.getLogger().debug("MQHelper init connections.");
        if (!c4utils_1.TypeUtils.isArray(ConnectionsConfig)
            || c4utils_1.TypeUtils.isEmptyArray(ConnectionsConfig)) {
            c4.getLogger().warn("MQHelper get empty connections config.");
            return true;
        }
        for (let i = 0; i < ConnectionsConfig.length; i++) {
            let CurConnConfig = ConnectionsConfig[i];
            if (!CurConnections.has(CurConnConfig.name)) {
                let Conn = new c4_mq_1.C4MQ();
                let TempConfig = JSON.parse(JSON.stringify(CurConnConfig));
                delete TempConfig.name;
                try {
                    yield Conn.init(TempConfig, c4.getLogger());
                }
                catch (error) {
                    c4.getLogger().err(error);
                    return false;
                }
                CurConnections.set(CurConnConfig.name, Conn);
            }
        }
        if (c4utils_1.TypeUtils.isArray(PublishersConfig)
            && !c4utils_1.TypeUtils.isEmptyArray(PublishersConfig)) {
            c4.getLogger().debug("MQHelper init publishers.");
            for (let i = 0; i < PublishersConfig.length; i++) {
                let CurPubConfig = PublishersConfig[i];
                if (!CurPublishers.has(CurPubConfig.name)) {
                    let ConnName = CurPubConfig.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                    let UsedConn = CurConnections.get(ConnName);
                    if (c4utils_1.TypeUtils.isEmptyObj(UsedConn)) {
                        c4.getLogger().err("MQHelper init publisher can't find connection : " + ConnName + ".");
                        return false;
                    }
                    let TempConfig = JSON.parse(JSON.stringify(CurPubConfig));
                    delete TempConfig.connection;
                    let Publisher = new c4_mq_1.C4Publisher();
                    let Res = yield Publisher.init(UsedConn, TempConfig, c4.getLogger());
                    if (!Res) {
                        return false;
                    }
                    CurPublishers.set(CurPubConfig.name, Publisher);
                }
            }
        }
        if (c4utils_1.TypeUtils.isArray(SubscribersConfig)
            && !c4utils_1.TypeUtils.isEmptyArray(SubscribersConfig)) {
            c4.getLogger().debug("MQHelper init subscribers.");
            for (let i = 0; i < SubscribersConfig.length; i++) {
                let CurSubConfig = SubscribersConfig[i];
                if (!CurSubscribers.get(CurSubConfig.name)) {
                    let ConnName = CurSubConfig.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                    let UsedConn = CurConnections.get(ConnName);
                    if (c4utils_1.TypeUtils.isEmptyObj(UsedConn)) {
                        c4.getLogger().err("MQHelper init subscriber can't find connection : " + ConnName + ".");
                        return false;
                    }
                    let TempConfig = JSON.parse(JSON.stringify(CurSubConfig));
                    let MQHandlers = TempConfig.handlers;
                    delete TempConfig.connection;
                    delete TempConfig.handlers;
                    let Subscriber = new c4_mq_1.C4Subscriber();
                    let Res = yield Subscriber.init(UsedConn, TempConfig, c4.getLogger());
                    if (!Res) {
                        return false;
                    }
                    Subscriber.addMQHandler(MQHandlers);
                    CurSubscribers.set(CurSubConfig.name, Subscriber);
                    if (CurSubConfig.subscribeLater) {
                        SubscribeLater.push(CurSubConfig.name);
                    }
                    else {
                        yield Subscriber.subscribe();
                    }
                }
            }
        }
        c4.getLogger().debug('MQHelper init finished.');
        return true;
    });
}
exports.default = MQHelper;
//# sourceMappingURL=MQHelper.js.map