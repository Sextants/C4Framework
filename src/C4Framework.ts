import C4AJV from 'c4ajv';
import { C4Configger } from 'c4configger';
import { C4Logger } from 'c4logger';
import { C4EurekaClient } from "c4eurekaclient";
import { C4RESTFulClient } from "c4restfulclient";
import { C4WebService } from "c4webservice";
import { C4Publisher, C4Subscriber, C4MQ } from 'c4-mq';
import C4ApplicationInfo, { AppProfiles, ServiceStatus } from './C4FrameworkTypes/C4ApplicationInfo';
import { TypeUtils } from "c4utils";
import { Sleep } from "./C4FrameworkUtils/AppInfoUtils";

import { C4InitFlow } from './C4Helpers/C4Helper';

import { Sequelize } from 'sequelize-typescript';
import Redis = require('ioredis');
import { C4DependencyService } from 'c4apisclient';

const WaitExitMs = 5000;

export default class C4Framework {
  //
  private m_AJV: C4AJV | null;                                      // 验证器
  private m_Configger: C4Configger | null;                          // 配置加载器
  private m_Logger: C4Logger | null;                                // 日志

  private m_EurekaClient: C4EurekaClient | null;                    // eureka客户端

  private m_RestfulClient: C4RESTFulClient | null;                  // rest 客户端（多个）
  private m_WebServices: Map<string, C4WebService>;                 // webservice（多个）
  private m_DBClients: Map<string, Sequelize>;                      // DB
  private m_RedisClients: Map<string, Redis.Cluster | Redis.Redis>; // RedisClient
  private m_Publishers: Map<string, C4Publisher>;                   // MQ的发布者
  private m_Subscribers: Map<string, C4Subscriber>;                 // MQ的订阅者
  private m_MQConns: Map<string, C4MQ>;                             // MQ的连接
  private m_SubscribeLater: string[];                               // 延迟订阅的订阅者名字
  private m_DependServices: Map<string, C4DependencyService>;       // 依赖的服务发

  private m_AppInfo: C4ApplicationInfo;                             // App Info
  private m_Profiles: AppProfiles;                                  // App Profiles

  private m_Argv: any;                                              // 其他启动参数

  private m_BeforeInit: any;                                        // 在Init之前执行的方法
  private m_CustomInit: any;                                        // 自定义初始化过程
  private m_ConfigHook: any;                                        // 在配置加载完毕后调用的Hook
  private m_CustomLaunch: any;                                      // 自定义启动过程

  private m_IsDebug: boolean;

  private m_Helper: any[];

  private m_AppData: any;

  static getConfig() { return C4Configger.g_Config; }

  constructor(customProcess?: {
    beforeInit: any,
    init: any,
    configHook: any,
    launch: any
  }) {
    this.m_AJV = null;
    this.m_Configger = null;
    this.m_Logger = null;
    this.m_EurekaClient = null;
    this.m_RestfulClient = null;
    this.m_WebServices = new Map();
    this.m_DBClients = new Map();
    this.m_RedisClients = new Map();
    this.m_Publishers = new Map();
    this.m_Subscribers = new Map();
    this.m_MQConns = new Map();
    this.m_SubscribeLater = [];
    this.m_DependServices = new Map();
    this.m_AppInfo = {
      AppName: "",
      Version: "",
      InstanceID: "",
      ConfigLabel: "",
      Labels: [],
      Host: "",
      Port: 0,
      Desc: ""
    };

    this.m_Profiles = "";
    this.m_Argv = {};
    if (customProcess) {
      this.m_BeforeInit   = customProcess.beforeInit || null;
      this.m_CustomInit   = customProcess.init || null;
      this.m_ConfigHook   = customProcess.configHook || null;
      this.m_CustomLaunch = customProcess.launch || null;
    }

    this.m_Helper = [];

    this.m_IsDebug = false;
  }

  getChecker() { return this.m_AJV; }
  getConfigger() { return this.m_Configger; }
  getLogger() { return this.m_Logger; }
  getAppInfo() { return this.m_AppInfo; }
  getRegistryClient() { return this.m_EurekaClient; }
  getProfiles() { return this.m_Profiles; }
  getArgv() { return this.m_Argv; }
  getWebServices() { return this.m_WebServices; }
  getDBClients() { return this.m_DBClients; }
  getRedisClients() { return this.m_RedisClients; }
  getPublishers() { return this.m_Publishers; }
  getSubscribers() { return this.m_Subscribers; }
  getMQConnections() { return this.m_MQConns; }
  getSubscribeLater() { return this.m_SubscribeLater; }
  getDependencies() { return this.m_DependServices; }
  getDBClient(name: string) {
    return this.m_DBClients.get(name);
  }
  getRedisClient(name: string) {
    return this.m_RedisClients.get(name);
  }
  getPublisher(name: string) {
    return this.m_Publishers.get(name);
  }
  getSubscriber(name: string) {
    return this.m_Subscribers.get(name);
  }
  getMQConnection(name: string) {
    return this.m_MQConns.get(name);
  }
  getDependency(name: string) {
    return this.m_DependServices.get(name);
  }
  getRESTClient() {
    return this.m_RestfulClient;
  }
  getAppData<T>() {
    return this.m_AppData as T;
  }
  getIsDebug() {
    return this.m_IsDebug;
  }
  getConfigHook() {
    return this.m_ConfigHook;
  }

  // 
  setChecker(ajv: C4AJV) { this.m_AJV = ajv; }
  setConfigger(configger: C4Configger | null) { this.m_Configger = configger; }
  setLogger(logger: C4Logger) { this.m_Logger = logger; }
  setAppInfo(appInfo: C4ApplicationInfo) { this.m_AppInfo = appInfo; }
  setRegistryClient(client: C4EurekaClient) { this.m_EurekaClient = client; }
  setProfiles(profiles: AppProfiles) { this.m_Profiles = profiles; }
  setArgv(argv: any) { this.m_Argv = argv; }
  setDebug(isDebug: boolean) { this.m_IsDebug = isDebug; }
  setRESTClient(client: C4RESTFulClient) { this.m_RestfulClient = client; }
  setAppData<T>(appData: T) { this.m_AppData = appData; }

  async init() {
    //
    ServiceStatus.Status = "Initializing";

    // add C4Framework instance into global object
    (<any>global)["C4"] = this;

    try {
      if (this.m_CustomInit
        && (TypeUtils.isFunction(this.m_BeforeInit)
        || TypeUtils.isAsyncFunction(this.m_BeforeInit)
        || TypeUtils.isPromise(this.m_BeforeInit)
        || TypeUtils.isGeneratorFunction(this.m_BeforeInit))) {
        await this.m_BeforeInit(this);
      }

      let HelpersName: string[] = []
      this.m_Helper = await C4InitFlow(HelpersName);
      let DelaySubscribeHelper: any;
      for (let i = 0; i < this.m_Helper.length; i++) {
        if (this.m_Helper[i].name === "DelaySubscribeHelper") {
          DelaySubscribeHelper = this.m_Helper[i];
          continue;
        }
        let Res = await this.m_Helper[i](this).catch((err: any) => {
          console.log(err);
          return false;
        });
        if (!Res) {
          console.log(`Exec helper ${HelpersName[i]} failed.`);
          await Sleep(WaitExitMs);
          process.exit(-1);
        }
      }
      
      if (this.m_CustomInit
        && (TypeUtils.isFunction(this.m_CustomInit)
        || TypeUtils.isAsyncFunction(this.m_CustomInit)
        || TypeUtils.isPromise(this.m_CustomInit)
        || TypeUtils.isGeneratorFunction(this.m_CustomInit))) {
        await this.m_CustomInit(this);
      }

      // 
      if (DelaySubscribeHelper) {
        let Res = await DelaySubscribeHelper(this).catch((err : any) => {
          console.log(err);
          return false;
        });
        if (!Res) {
          console.log(`Exec helper DelaySubscribeHelper failed.`);
          await Sleep(WaitExitMs);
          process.exit(-1);
        }
      }

      // 最后要把所有的订阅启动
      ServiceStatus.Status = "Starting";
    } catch (error) {
      if (this.m_Logger) {
        this.m_Logger.err(error);
      } else {
        console.error(error);
      }
      await Sleep(WaitExitMs);
      process.exit(-1);
    }
  }

  async launch() {
    try {
      let bRun = true;
      if (this.m_CustomLaunch && TypeUtils.isFunction(this.m_CustomLaunch)) {
        bRun = await this.m_CustomLaunch(this);
      }
      if (bRun) {
        let LoggedRunningInterval = C4Configger.g_Config.LoggedRunningInterval;
        if (!TypeUtils.isInt(LoggedRunningInterval)) {
          LoggedRunningInterval = 20000;
        } else {
          if (LoggedRunningInterval > 0) {
            setInterval(() => {
              (<C4Logger>this.m_Logger).info('running...')
            }, LoggedRunningInterval)
          }
        }
        ServiceStatus.Status = "Running";
      }
    } catch (error) {
      if (this.m_Logger) {
        this.m_Logger.err(error);
      } else {
        console.error(error);
      }
      await Sleep(WaitExitMs);
      process.exit(-1);
    }
  }

  done() {
    ServiceStatus.Status = "Running";
  }

  static getC4() {
    return <C4Framework | undefined>(<any>global).C4;
  }
}
