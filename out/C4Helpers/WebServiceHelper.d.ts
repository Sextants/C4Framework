import C4Framework from '../C4Framework';
/**
 * 初始化Web Service
 * 应当初始化一个获取当前服务状态的服务
 * 然后再根据配置初始化其他业务相关的服务
 * @param c4 C4Framework
 */
export default function WebServiceHelper(c4: C4Framework): Promise<boolean>;
