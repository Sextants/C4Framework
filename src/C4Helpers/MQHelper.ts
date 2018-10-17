import C4Framework from "../C4Framework";
import { C4Logger } from "c4logger";
import { TypeUtils } from "c4utils";
import { C4MQ, C4Publisher, C4Subscriber } from "c4-mq";

/**
 * 初始化MQ、Publisher和Subscriber
 * 对于标记了subscribeLater的Subscriber会在DelaySubscribeHelper中进行订阅
 * @param c4 C4Framework
 */
export default async function MQHelper(c4 : C4Framework) {
    // 可以有多个连接
    // 可以有多个Publisher和Subscriber
    // 都有名字，通过名字标记
    // 可以通过名字获取实例
    (<C4Logger>c4.getLogger()).debug("MQHelper in");
    let CurConnections  = c4.getMQConnections();
    let CurPublishers   = c4.getPublishers();
    let CurSubscribers  = c4.getSubscribers();
    let SubscribeLater  = c4.getSubscribeLater();
    let CurConfig       = C4Framework.getConfig();
    if (TypeUtils.isEmptyObj(CurConfig.MQClients)) {
        (<C4Logger>c4.getLogger()).debug("MQHelper no handler init.");
        return true;
    }

    let ConnectionsConfig   = CurConfig.MQClients.connections;
    let PublishersConfig    = CurConfig.MQClients.publishers;
    let SubscribersConfig   = CurConfig.MQClients.subscribers;

    (<C4Logger>c4.getLogger()).debug("MQHelper init connections.");
    if (!TypeUtils.isArray(ConnectionsConfig)
        || TypeUtils.isEmptyArray(ConnectionsConfig)) {
            (<C4Logger>c4.getLogger()).warn("MQHelper get empty connections config.");
            return true;
    }
    for (let i = 0; i < ConnectionsConfig.length; i++) {
        let CurConnConfig = ConnectionsConfig[i];
        if (!CurConnections.has(CurConnConfig.name)) {
            let Conn = new C4MQ();
            let TempConfig = JSON.parse(JSON.stringify(CurConnConfig));
            delete TempConfig.name;
            try {
                await Conn.init(TempConfig, c4.getLogger());
            } catch (error) {
                (<C4Logger>c4.getLogger()).err(error);
                return false;
            }
            
            CurConnections.set(CurConnConfig.name, Conn);
        }
    }

    if (TypeUtils.isArray(PublishersConfig)
        && !TypeUtils.isEmptyArray(PublishersConfig)) {
        (<C4Logger>c4.getLogger()).debug("MQHelper init publishers.");
        for (let i = 0; i < PublishersConfig.length; i++) {
            let CurPubConfig = PublishersConfig[i];
            if (!CurPublishers.has(CurPubConfig.name)) {
                let ConnName = CurPubConfig.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                let UsedConn = CurConnections.get(ConnName);
                if (TypeUtils.isEmptyObj(UsedConn)) {
                    (<C4Logger>c4.getLogger()).err("MQHelper init publisher can't find connection : " + ConnName + ".");
                    return false;
                }

                let TempConfig = JSON.parse(JSON.stringify(CurPubConfig));
                delete TempConfig.connection;

                let Publisher = new C4Publisher();
                let Res = await Publisher.init(<C4MQ>UsedConn, TempConfig, c4.getLogger());
                if (!Res) {
                    return false;
                }

                CurPublishers.set(CurPubConfig.name, Publisher);
            }
        }
    }

    if (TypeUtils.isArray(SubscribersConfig)
        && !TypeUtils.isEmptyArray(SubscribersConfig)) {
        (<C4Logger>c4.getLogger()).debug("MQHelper init subscribers.");
        for (let i = 0; i < SubscribersConfig.length; i++) {
            let CurSubConfig = SubscribersConfig[i];
            if (!CurSubscribers.get(CurSubConfig.name)) {
                let ConnName    = CurSubConfig.connection.replace(/^{MQConnections:[\s]*/g, '').replace(/[\s]*}/g, '');
                let UsedConn    = CurConnections.get(ConnName);
                if (TypeUtils.isEmptyObj(UsedConn)) {
                    (<C4Logger>c4.getLogger()).err("MQHelper init subscriber can't find connection : " + ConnName + ".");
                    return false;
                }

                let TempConfig  = JSON.parse(JSON.stringify(CurSubConfig));
                let MQHandlers  = TempConfig.handlers;
                delete TempConfig.connection;
                delete TempConfig.handlers;

                let Subscriber = new C4Subscriber();
                let Res = await Subscriber.init(<C4MQ>UsedConn, TempConfig, c4.getLogger());
                if (!Res) {
                    return false;
                }

                Subscriber.addMQHandler(MQHandlers);

                CurSubscribers.set(CurSubConfig.name, Subscriber);
                if (CurSubConfig.subscribeLater) {
                    SubscribeLater.push(CurSubConfig.name);
                } else {
                    await Subscriber.subscribe();
                }
            }
        }
    }

    (<C4Logger>c4.getLogger()).debug('MQHelper init finished.');

    return true;
}
