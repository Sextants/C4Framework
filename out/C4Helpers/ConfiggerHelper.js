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
const AppInfoUtils_1 = require("../C4FrameworkUtils/AppInfoUtils");
const out_1 = require("c4utils/out");
const ConfiggerConfigPath = './Config/Configger.yml';
const ApplicationInfoSechema = "http://sextants/C4Framework/ApplicationInfo.json";
function initConfigger(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        if (c4.getConfigger() === null) {
            let CurAppInfo = c4.getAppInfo();
            let Configger = new c4configger_1.C4Configger({
                AppName: CurAppInfo.AppName,
                Version: CurAppInfo.Version,
                host: CurAppInfo.Host,
                port: CurAppInfo.Port,
                InstanceID: CurAppInfo.InstanceID,
                Profiles: "",
                Label: CurAppInfo.ConfigLabel,
                Checker: c4.getChecker(),
                ConfigPath: ConfiggerConfigPath
            });
            try {
                yield Configger.init();
                c4.setConfigger(Configger);
                return true;
            }
            catch (error) {
                c4.getLogger().err(error);
                return false;
            }
        }
        return true;
    });
}
/**
 * 初始化Configger
 * 根据配置从本地或远程源加载配置
 * 加载完毕后配置存储在C4Configger的静态成员变量g_Config中
 * @param c4 C4Framework
 */
function ConfiggerHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        let Res = yield initConfigger(c4);
        if (!Res) {
            return Res;
        }
        let ConfiggerLoadType = c4.getConfigger().loadType();
        if (ConfiggerLoadType === "Remote" || ConfiggerLoadType === "Local") {
            let ValidRes = AppInfoUtils_1.ValidateAppInfo(c4.getChecker(), ApplicationInfoSechema, c4.getAppInfo());
            if (ValidRes === false) {
                c4.getLogger().err("Invalid Application Info.");
                c4.setConfigger(null);
                return false;
            }
        }
        else {
            c4.getLogger().err("Unknown Configger load type, may configger init failed.");
            c4.setConfigger(null);
            return false;
        }
        yield c4.getConfigger().load();
        let ConfigHook = c4.getConfigHook();
        if (ConfigHook
            && (out_1.TypeUtils.isFunction(ConfigHook)
                || out_1.TypeUtils.isAsyncFunction(ConfigHook)
                || out_1.TypeUtils.isPromise(ConfigHook)
                || out_1.TypeUtils.isGeneratorFunction(ConfigHook))) {
            yield ConfigHook(c4);
        }
        // console.log(JSON.stringify(C4Framework.getConfig(), null, 4))
        // if (ConfiggerLoadType === "Local") {
        //     let ValidRes = ValidateAppInfo(<C4AJV>(<any>c4).m_AJV, ApplicationInfoSechema, c4.getAppInfo());
        //     if (ValidRes === false) {
        //         c4.setConfigger(null);
        //         (<C4Logger>c4.getLogger()).err("Invalid Application Info.");
        //         return false;
        //     }
        // }
        return true;
    });
}
exports.default = ConfiggerHelper;
//# sourceMappingURL=ConfiggerHelper.js.map