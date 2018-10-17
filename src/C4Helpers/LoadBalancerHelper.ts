import C4Framework from "../C4Framework";
import { C4Logger } from "c4logger";

/**
 * 无用
 * @param c4 
 */
export default async function LoadBalancerHelper(c4 : C4Framework) {
    // 根据依赖项目获取对应服务实例的statusPage
    // 通过各statusPage获取支持负载均衡算法和比重（对于没有设置的负载均衡算法，若本方使用则权重均为1）
    // 设置C4Framework中各服务各实例的请求地址和端口，以及权重
    // 设置定时器，定时调用eureka client来更新依赖项目的状态
    let CurLogger = (<C4Logger>c4.getLogger());
    CurLogger.debug("LoadBalancerHelper in.");
    // let 
    return true;
}