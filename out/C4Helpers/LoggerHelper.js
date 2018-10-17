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
const c4logger_1 = require("c4logger");
const c4utils_1 = require("c4utils");
const Yaml = require("js-yaml");
const LoggerConfigPath = './Config/C4Logger.yml';
const LoggerConfigSechema = "http://sextants/C4Framework/LoggerConfig.json";
/**
 * 初始化Logger
 * @param c4 C4Framework
 */
function LoggerHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        if (null == c4.getLogger()) {
            // 加载日志配置
            let doc = null;
            try {
                let data = yield c4utils_1.FSP.ReadFile(LoggerConfigPath, {
                    encoding: 'utf8',
                    flag: 'r'
                });
                doc = Yaml.safeLoad(data);
                if (c4utils_1.TypeUtils.isEmptyObj(doc)) {
                    throw new Error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Logger config is empty.");
                }
            }
            catch (error) {
                console.error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Load logger config failed.");
                console.log(error);
                return false;
            }
            if (null !== c4.getChecker()) {
                let Res = c4.getChecker().validate(LoggerConfigSechema, doc);
                if (Res === false) {
                    console.error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Invalid logger config file.");
                    return false;
                }
            }
            else {
                console.warn("[" + (new Date()).toLocaleString() + "]" + ' [C4Framework] JSON checker not init, can not check logger config.');
            }
            console.debug("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] init logger...");
            let Logger = new c4logger_1.C4Logger();
            yield Logger.init(doc);
            c4.setLogger(Logger);
            console.debug("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] init logger succeed.");
        }
        return true;
    });
}
exports.default = LoggerHelper;
//# sourceMappingURL=LoggerHelper.js.map