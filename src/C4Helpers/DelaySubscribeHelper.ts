import C4Framework from "../C4Framework";
import { C4Logger } from "c4logger";

/**
 * 延迟订阅的Subscribers
 * @param c4 C4Framework
 */
export default async function DelaySubscribeHelper(c4 : C4Framework) {
    (<C4Logger>c4.getLogger()).debug("DelaySubscribeHelper in");
    let CurSubscribers  = c4.getSubscribers();
    let SubscribeLater  = c4.getSubscribeLater();

    for (let i = 0; i < SubscribeLater.length; i++) {
        let curSub = CurSubscribers.get(SubscribeLater[i]);
        if (curSub) {
            await curSub.subscribe();
        } else {
            (<C4Logger>c4.getLogger()).warn(`Unable to find subscriber(${SubscribeLater[i]}) with delayed subscription.`);
        }
    }

    (<C4Logger>c4.getLogger()).debug('DelaySubscribeHelper init finished.');

    return true;
}
