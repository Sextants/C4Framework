import Redis = require('ioredis');
import C4Framework from '../C4Framework';
import { C4Logger } from 'c4logger';
import { TypeUtils } from 'c4utils';

/**
 * 初始化Redis连接，支持集群模式
 * @param c4 C4Framework
 */
export default async function ROMHelper(c4: C4Framework) {
    (<C4Logger>c4.getLogger()).debug('ROMHelper in');
    let RedisClients = c4.getRedisClients();
    let CurConfig    = C4Framework.getConfig();
    if (TypeUtils.isEmptyObj(CurConfig.RedisClients)) {
        (<C4Logger>c4.getLogger()).debug('ROMHelper no Redis init.');
        return true;
    }

    /**
     * TODO: 增加对应的校验schema配置
     */
    for (let i = 0; i < CurConfig.RedisClients.length; i++) {
        let CurRedisConfig = CurConfig.RedisClients[i];
        if (!RedisClients.has(CurRedisConfig.name)) {
            let CurInstance : Redis.Redis;
            if (CurRedisConfig.isCluster) {
                // Redis Cluster client
                CurInstance = new Redis.Cluster(
                    CurRedisConfig.clusterNodes, {
                    enableOfflineQueue      : CurRedisConfig.enableOfflineQueue,
                    enableReadyCheck        : CurRedisConfig.enableReadyCheck,
                    maxRedirections         : CurRedisConfig.maxRedirections,
                    retryDelayOnFailover    : CurRedisConfig.retryDelayOnFailover,
                    retryDelayOnClusterDown : CurRedisConfig.retryDelayOnClusterDown,
                    redisOptions            : {
                        family          : 4,
                        connectionName  : CurRedisConfig.connectionName,
                        db              : 0,
                        password        : CurRedisConfig.password,
                        retryStrategy   : function(times) {
                            if (times > CurRedisConfig.totalRetryTime) {
                                return false;
                            }
                            return Math.min(times * 100, CurRedisConfig.attempt);
                        },
                        reconnectOnError : function(err) {
                            let TargetError = 'READONLY';
                            if (err.message.slice(0, TargetError.length) === TargetError) {
                                return true;
                            }
                            return false;
                        }
                    },
                    clusterRetryStrategy : function(times) {
                        if (times > CurRedisConfig.totalRetryTime) {
                            return -1;
                        }
                        return Math.min(times * 100, CurRedisConfig.attempt);
                    }
                });

                /**
                 * 首次连接超时则抛出异常
                 */
                let once = true;
                await new Promise((resolve, reject) => {
                    CurInstance.on('ready', () => {
                        once = false;
                        resolve();
                    });
                    CurInstance.on('error', (err) => {
                        (<C4Logger>c4.getLogger()).err(err);
                        if (once) {
                            once = false;
                            if (err.code === "ETIMEDOUT") {
                                reject();
                            }
                        }
                    });
                });
            } else {
                // Redis client
                CurInstance = new Redis(
                    CurRedisConfig.port,
                    CurRedisConfig.host,
                    {
                        family              : 4,
                        connectionName      : CurRedisConfig.connectionName,
                        db                  : CurRedisConfig.db,
                        password            : CurRedisConfig.password,
                        connectTimeout      : CurRedisConfig.connectTimeout,
                        retryStrategy : function(times) {
                            if (times > CurRedisConfig.totalRetryTime) {
                                return false;
                            }
                            return Math.min(times * 100, CurRedisConfig.attempt);
                        },
                        reconnectOnError : function(err) {
                            var TargetError = 'READONLY';
                            if (err.message.slice(0, TargetError.length) === TargetError) {
                                return true;
                            }
                            return false;
                        }
                    }
                );

                /**
                 * 首次连接超时则抛出异常
                 */
                let once = true;
                await new Promise((resolve, reject) => {
                    CurInstance.on('ready', () => {
                        // console.log(JSON.stringify(arguments));
                        once = false;
                        resolve();
                    });

                    CurInstance.on('error', (err) => {
                        (<C4Logger>c4.getLogger()).err(err);
                        if (once) {
                            once = false;
                            if (err.code === "ETIMEDOUT") {
                                reject();
                            }
                        }
                    });
                });
            }
            RedisClients.set(CurRedisConfig.name, CurInstance);
        }
    }

    (<C4Logger>c4.getLogger()).debug('ROMHelper init Redis finished.');

    return true;
}
