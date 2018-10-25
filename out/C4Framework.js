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
const c4configger_1 = require("c4configger");
const C4ApplicationInfo_1 = require("./C4FrameworkTypes/C4ApplicationInfo");
const c4utils_1 = require("c4utils");
const AppInfoUtils_1 = require("./C4FrameworkUtils/AppInfoUtils");
const C4Helper_1 = require("./C4Helpers/C4Helper");
const WaitExitMs = 5000;
class C4Framework {
    static getConfig() { return c4configger_1.C4Configger.g_Config; }
    constructor(customProcess) {
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
            this.m_BeforeInit = customProcess.beforeInit || null;
            this.m_CustomInit = customProcess.init || null;
            this.m_ConfigHook = customProcess.configHook || null;
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
    getDBClient(name) {
        return this.m_DBClients.get(name);
    }
    getRedisClient(name) {
        return this.m_RedisClients.get(name);
    }
    getPublisher(name) {
        return this.m_Publishers.get(name);
    }
    getSubscriber(name) {
        return this.m_Subscribers.get(name);
    }
    getMQConnection(name) {
        return this.m_MQConns.get(name);
    }
    getDependency(name) {
        return this.m_DependServices.get(name);
    }
    getRESTClient() {
        return this.m_RestfulClient;
    }
    getAppData() {
        return this.m_AppData;
    }
    getIsDebug() {
        return this.m_IsDebug;
    }
    getConfigHook() {
        return this.m_ConfigHook;
    }
    // 
    setChecker(ajv) { this.m_AJV = ajv; }
    setConfigger(configger) { this.m_Configger = configger; }
    setLogger(logger) { this.m_Logger = logger; }
    setAppInfo(appInfo) { this.m_AppInfo = appInfo; }
    setRegistryClient(client) { this.m_EurekaClient = client; }
    setProfiles(profiles) { this.m_Profiles = profiles; }
    setArgv(argv) { this.m_Argv = argv; }
    setDebug(isDebug) { this.m_IsDebug = isDebug; }
    setRESTClient(client) { this.m_RestfulClient = client; }
    setAppData(appData) { this.m_AppData = appData; }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            //
            C4ApplicationInfo_1.ServiceStatus.Status = "Initializing";
            // add C4Framework instance into global object
            global["C4"] = this;
            try {
                if (this.m_CustomInit && c4utils_1.TypeUtils.isFunction(this.m_BeforeInit)) {
                    yield this.m_BeforeInit(this);
                }
                let HelpersName = [];
                this.m_Helper = yield C4Helper_1.C4InitFlow(HelpersName);
                let DelaySubscribeHelper;
                for (let i = 0; i < this.m_Helper.length; i++) {
                    if (this.m_Helper[i].name === "DelaySubscribeHelper") {
                        DelaySubscribeHelper = this.m_Helper[i];
                        continue;
                    }
                    let Res = yield this.m_Helper[i](this).catch((err) => {
                        console.log(err);
                        return false;
                    });
                    if (!Res) {
                        console.log(`Exec helper ${HelpersName[i]} failed.`);
                        yield AppInfoUtils_1.Sleep(WaitExitMs);
                        process.exit(-1);
                    }
                }
                if (this.m_CustomInit && c4utils_1.TypeUtils.isFunction(this.m_CustomInit)) {
                    yield this.m_CustomInit(this);
                }
                // 
                if (DelaySubscribeHelper) {
                    let Res = yield DelaySubscribeHelper(this).catch((err) => {
                        console.log(err);
                        return false;
                    });
                    if (!Res) {
                        console.log(`Exec helper DelaySubscribeHelper failed.`);
                        yield AppInfoUtils_1.Sleep(WaitExitMs);
                        process.exit(-1);
                    }
                }
                // 最后要把所有的订阅启动
                C4ApplicationInfo_1.ServiceStatus.Status = "Starting";
            }
            catch (error) {
                if (this.m_Logger) {
                    this.m_Logger.err(error);
                }
                else {
                    console.error(error);
                }
                yield AppInfoUtils_1.Sleep(WaitExitMs);
                process.exit(-1);
            }
        });
    }
    launch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let bRun = true;
                if (this.m_CustomLaunch && c4utils_1.TypeUtils.isFunction(this.m_CustomLaunch)) {
                    bRun = yield this.m_CustomLaunch(this);
                }
                if (bRun) {
                    let LoggedRunningInterval = c4configger_1.C4Configger.g_Config.LoggedRunningInterval;
                    if (!c4utils_1.TypeUtils.isInt(LoggedRunningInterval)) {
                        LoggedRunningInterval = 20000;
                    }
                    else {
                        if (LoggedRunningInterval > 0) {
                            setInterval(() => {
                                this.m_Logger.info('running...');
                            }, LoggedRunningInterval);
                        }
                    }
                    C4ApplicationInfo_1.ServiceStatus.Status = "Running";
                }
            }
            catch (error) {
                if (this.m_Logger) {
                    this.m_Logger.err(error);
                }
                else {
                    console.error(error);
                }
                yield AppInfoUtils_1.Sleep(WaitExitMs);
                process.exit(-1);
            }
        });
    }
    done() {
        C4ApplicationInfo_1.ServiceStatus.Status = "Running";
    }
    static getC4() {
        return global.C4;
    }
}
exports.default = C4Framework;
//# sourceMappingURL=C4Framework.js.map