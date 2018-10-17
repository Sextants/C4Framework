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
const Redis = require("ioredis");
const C4Framework_1 = require("../C4Framework");
const c4utils_1 = require("c4utils");
/**
 * 初始化Redis连接，支持集群模式
 * @param c4 C4Framework
 */
function ROMHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug('ROMHelper in');
        let RedisClients = c4.getRedisClients();
        let CurConfig = C4Framework_1.default.getConfig();
        if (c4utils_1.TypeUtils.isEmptyObj(CurConfig.RedisClients)) {
            c4.getLogger().debug('ROMHelper no Redis init.');
            return true;
        }
        /**
         * TODO: 增加对应的校验schema配置
         */
        for (let i = 0; i < CurConfig.RedisClients.length; i++) {
            let CurRedisConfig = CurConfig.RedisClients[i];
            if (!RedisClients.has(CurRedisConfig.name)) {
                let CurInstance;
                if (CurRedisConfig.isCluster) {
                    // Redis Cluster client
                    CurInstance = new Redis.Cluster(CurRedisConfig.clusterNodes, {
                        enableOfflineQueue: CurRedisConfig.enableOfflineQueue,
                        enableReadyCheck: CurRedisConfig.enableReadyCheck,
                        maxRedirections: CurRedisConfig.maxRedirections,
                        retryDelayOnFailover: CurRedisConfig.retryDelayOnFailover,
                        retryDelayOnClusterDown: CurRedisConfig.retryDelayOnClusterDown,
                        redisOptions: {
                            family: 4,
                            connectionName: CurRedisConfig.connectionName,
                            db: 0,
                            password: CurRedisConfig.password,
                            retryStrategy: function (times) {
                                if (times > CurRedisConfig.totalRetryTime) {
                                    return false;
                                }
                                return Math.min(times * 100, CurRedisConfig.attempt);
                            },
                            reconnectOnError: function (err) {
                                let TargetError = 'READONLY';
                                if (err.message.slice(0, TargetError.length) === TargetError) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        clusterRetryStrategy: function (times) {
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
                    yield new Promise((resolve, reject) => {
                        CurInstance.on('ready', () => {
                            once = false;
                            resolve();
                        });
                        CurInstance.on('error', (err) => {
                            c4.getLogger().err(err);
                            if (once) {
                                once = false;
                                if (err.code === "ETIMEDOUT") {
                                    reject();
                                }
                            }
                        });
                    });
                }
                else {
                    // Redis client
                    CurInstance = new Redis(CurRedisConfig.port, CurRedisConfig.host, {
                        family: 4,
                        connectionName: CurRedisConfig.connectionName,
                        db: CurRedisConfig.db,
                        password: CurRedisConfig.password,
                        connectTimeout: CurRedisConfig.connectTimeout,
                        retryStrategy: function (times) {
                            if (times > CurRedisConfig.totalRetryTime) {
                                return false;
                            }
                            return Math.min(times * 100, CurRedisConfig.attempt);
                        },
                        reconnectOnError: function (err) {
                            var TargetError = 'READONLY';
                            if (err.message.slice(0, TargetError.length) === TargetError) {
                                return true;
                            }
                            return false;
                        }
                    });
                    /**
                     * 首次连接超时则抛出异常
                     */
                    let once = true;
                    yield new Promise((resolve, reject) => {
                        CurInstance.on('ready', () => {
                            // console.log(JSON.stringify(arguments));
                            once = false;
                            resolve();
                        });
                        CurInstance.on('error', (err) => {
                            c4.getLogger().err(err);
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
        c4.getLogger().debug('ROMHelper init Redis finished.');
        return true;
    });
}
exports.default = ROMHelper;
//# sourceMappingURL=ROMHelper.js.map