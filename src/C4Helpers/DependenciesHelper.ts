
/**
 * TODO: 
 * 用来等待依赖的服务
 * 配置依赖服务的负载均衡（通过服务名可以直接调用接口，内部实现调用具体实例）
 * 用来初始化依赖服务的RESTFul API调用接口
 * 用来初始化依赖服务的MQ API调用接口？
 */
// 用来等待依赖的服务

import C4Framework from '../C4Framework';
import { C4Logger } from "c4logger";
import { TypeUtils } from 'c4utils';
import { C4DependencyService, C4APIsClient } from 'c4apisclient';
import { C4LoadBalancer } from 'c4loadbalancer';
import { C4RESTFulClient } from 'c4restfulclient';
import { FSP } from 'c4utils';

const APIDir : string[] = ['./APIs', './out/APIs'];

/**
 * 获取依赖服务的信息，并加载对应的API Client
 * @param c4 C4Framework
 */
export default async function DependenciesHelper(c4 : C4Framework) {
    /**
     * TODO: 增加对应的校验schema配置
     */
    // check
    (<C4Logger>c4.getLogger()).debug('DependenciesHelper in');
    let dependencies = C4Framework.getConfig()["Dependencies"];
    if (dependencies && dependencies.apps) {
        if (!TypeUtils.isArray(dependencies.apps) || dependencies.apps.length === 0) {
            return true;
        }

        let CurDependencies = c4.getDependencies();
        for (let i = 0; i < dependencies.apps.length; i++) {
            let CurDependency   = dependencies.apps[i];

            // 初始化Load balancer
            let CurDS = new C4DependencyService(
                CurDependency.appName,
                CurDependency.timeout,
                CurDependency.required
            );
            let CurLB           = C4LoadBalancer.createBalancer(CurDependency.LBType);
            if (null === CurLB) {
                (<C4Logger>c4.getLogger()).err(`Create load balancer ${CurDependency.LBType} failed.`);
                throw new Error(`Create load balancer ${CurDependency.LBType} failed.`);
            }
            CurDS.setLoadBalancer(CurDependency.LBType, CurLB);

            // 初始化APIs Client
            // let CurAPIsTarget = LoadAPIsClient(CurDependency.APIs);
            let tempTargets = FSP.getModulesEx(CurDependency.APIs, APIDir, '', true);
            if (TypeUtils.isEmptyArray(tempTargets)) {
                (<C4Logger>c4.getLogger()).err(`Can't load ${CurDependency.APIs}.`);
                throw new Error(`Can't load ${CurDependency.APIs}.`);
            }
            let CurAPIsTarget = tempTargets[0];
            if (CurAPIsTarget === undefined) {
                (<C4Logger>c4.getLogger()).err(`Can't load ${CurDependency.APIs}.`);
                throw new Error(`Can't load ${CurDependency.APIs}.`);
            }
            let CurAPIsClient = <C4APIsClient>(new CurAPIsTarget());
            CurDS.setAPIsClient(CurAPIsClient, <C4RESTFulClient>c4.getRESTClient());
            CurDependencies.set(CurDependency.AppName, CurDS);
        }
    }
    (<C4Logger>c4.getLogger()).debug('DependenciesHelper init finish.');
    return true;
}
