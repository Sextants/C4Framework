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
/**
 * 延迟订阅的Subscribers
 * @param c4 C4Framework
 */
function DelaySubscribeHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug("DelaySubscribeHelper in");
        let CurSubscribers = c4.getSubscribers();
        let SubscribeLater = c4.getSubscribeLater();
        for (let i = 0; i < SubscribeLater.length; i++) {
            let curSub = CurSubscribers.get(SubscribeLater[i]);
            if (curSub) {
                yield curSub.subscribe();
            }
            else {
                c4.getLogger().warn(`Unable to find subscriber(${SubscribeLater[i]}) with delayed subscription.`);
            }
        }
        c4.getLogger().debug('DelaySubscribeHelper init finished.');
        return true;
    });
}
exports.default = DelaySubscribeHelper;
//# sourceMappingURL=DelaySubscribeHelper.js.map