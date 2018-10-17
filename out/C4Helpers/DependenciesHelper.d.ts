/**
 * TODO:
 * 用来等待依赖的服务
 * 配置依赖服务的负载均衡（通过服务名可以直接调用接口，内部实现调用具体实例）
 * 用来初始化依赖服务的RESTFul API调用接口
 * 用来初始化依赖服务的MQ API调用接口？
 */
import C4Framework from '../C4Framework';
/**
 * 获取依赖服务的信息，并加载对应的API Client
 * @param c4 C4Framework
 */
export default function DependenciesHelper(c4: C4Framework): Promise<boolean>;
