import C4Framewrok from '../C4Framework';
/**
 * 向Eureka服务进行注册
 * 注册时会将自身的LoadBalance信息写入到Metadata中
 * 默认为ConsistentHash，权重为1
 * TODO:Java端框架也应写入该值
 * @param c4 C4Framewrok
 */
export default function RegistryHelper(c4: C4Framewrok): Promise<boolean>;
