import C4Framework from "../C4Framework";
/**
 * 初始化MQ、Publisher和Subscriber
 * 对于标记了subscribeLater的Subscriber会在DelaySubscribeHelper中进行订阅
 * @param c4 C4Framework
 */
export default function MQHelper(c4: C4Framework): Promise<boolean>;
