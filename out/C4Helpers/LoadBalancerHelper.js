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
 * 无用
 * @param c4
 */
function LoadBalancerHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        // 根据依赖项目获取对应服务实例的statusPage
        // 通过各statusPage获取支持负载均衡算法和比重（对于没有设置的负载均衡算法，若本方使用则权重均为1）
        // 设置C4Framework中各服务各实例的请求地址和端口，以及权重
        // 设置定时器，定时调用eureka client来更新依赖项目的状态
        let CurLogger = c4.getLogger();
        CurLogger.debug("LoadBalancerHelper in.");
        // let 
        return true;
    });
}
exports.default = LoadBalancerHelper;
//# sourceMappingURL=LoadBalancerHelper.js.map