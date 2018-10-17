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
const __1 = require("..");
const c4utils_1 = require("c4utils");
const glob = require("glob");
const Path = require("path");
const c4restfulclient_1 = require("c4restfulclient");
var RedisCookieStore = require('redis-cookie-store');
const ParserDir = [
    './RESTClientParsers',
    './out/RESTClientParsers'
];
function LoadRESTClientParser(name) {
    if (!c4utils_1.TypeUtils.isString(name)
        || c4utils_1.TypeUtils.isEmptyStr(name)) {
        return undefined;
    }
    for (let i = 0; i < ParserDir.length; i++) {
        if (glob.hasMagic(name))
            return undefined;
        let parsedFile = Path.parse(name);
        let curPath = Path.join(parsedFile.dir, parsedFile.name);
        let fullPath = Path.join(process.cwd(), ParserDir[i], curPath + '.*');
        let IsInside = c4utils_1.PathUtils.PathInside(process.cwd(), fullPath);
        if (!IsInside) {
            continue;
        }
        return c4utils_1.FSP.getModules([fullPath], "", false)[0];
    }
    return undefined;
}
/**
 * 初始化RESTClient
 * @param c4 C4Framework
 */
function RESTClientHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug('RESTClientHelper in');
        /**
         * TODO: 增加对应的校验schema配置
         */
        //check
        let RESTClientConfig = __1.default.getConfig()["RESTClient"];
        if (c4utils_1.TypeUtils.isObject(RESTClientConfig)
            && !c4utils_1.TypeUtils.isEmptyObj(RESTClientConfig)) {
            let ParsersConfig = RESTClientConfig.parsers;
            delete RESTClientConfig.parsers;
            if (RESTClientConfig['cookiesOption']
                && RESTClientConfig['cookiesOption'].enabled === true) {
                if (RESTClientConfig['cookiesOption'].store) {
                    let IsClientRef = RESTClientConfig['cookiesOption'].store.match(/^{Redis:[\S\s]+}$/g);
                    if (IsClientRef === null) {
                        c4.getLogger().err('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                            + 'but client format error. Cur store client config is : %s.', RESTClientConfig['cookiesOption'].store + '.');
                        throw new Error('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                            + 'but client format error. Cur store client config is : ' + RESTClientConfig['cookiesOption'].store + '.');
                    }
                    let CurRedisClientName = RESTClientConfig['cookiesOption'].store.replace(/^{Redis:[\s]*/g, '').replace(/[\s]*}$/g, '');
                    let CurRedisClient = c4.getRedisClient(CurRedisClientName);
                    if (c4utils_1.TypeUtils.isEmptyObj(CurRedisClient)) {
                        c4.getLogger().err('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                            + 'but can\'t find client. Cur store client config is : %s.', RESTClientConfig['cookiesOption'].sotre);
                        throw new Error('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                            + 'but can\'t find client. Cur store client config is : ' + RESTClientConfig['cookiesOption'].sotre + '.');
                    }
                    let CurCookieStore = new RedisCookieStore(CurRedisClient, c4.getAppInfo().AppName + '-cokkie-store');
                    RESTClientConfig['cookiesOption'].store = CurCookieStore;
                }
            }
            let CurClient = c4.getRESTClient();
            if (CurClient === null) {
                // RESTClient没有初始化，在这里初始化
                CurClient = new c4restfulclient_1.C4RESTFulClient();
                yield CurClient.init(RESTClientConfig);
                c4.setRESTClient(CurClient);
            }
            // 加载Parsers
            if (c4utils_1.TypeUtils.isArray(ParsersConfig)
                && !c4utils_1.TypeUtils.isEmptyArray(ParsersConfig)) {
                for (let i = 0; i < RESTClientConfig.length; i++) {
                    let CurConfig = RESTClientConfig[i];
                    let CurParserName = CurConfig.parserName;
                    let CurParserPath = CurConfig.parser;
                    let TempParsers = c4utils_1.FSP.getModulesEx(CurParserPath, ['./RESTClientParsers',
                        './out/RESTClientParsers'], "", true);
                    if (!c4utils_1.TypeUtils.isArray(TempParsers)
                        || c4utils_1.TypeUtils.isEmptyArray(TempParsers)) {
                        c4.getLogger().err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                        throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                    }
                    let CurParser = (TempParsers[0]);
                    // let CurParser = LoadRESTClientParser(CurParserPath);
                    if (CurParser === undefined) {
                        c4.getLogger().err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                        throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                    }
                    if (CurParserName !== CurParser.name) {
                        c4.getLogger().err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed, want name: ${CurParserName}, cur name: ${CurParser.name}.`);
                        throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed, want name: ${CurParserName}, cur name: ${CurParser.name}.`);
                    }
                    CurClient.addParser(CurParser);
                }
            }
            c4.getLogger().debug('RESTClientHelper init finished.');
        }
        else {
            c4.getLogger().debug('RESTClientHelper no init.');
        }
        return true;
    });
}
exports.default = RESTClientHelper;
//# sourceMappingURL=RESTClientHelper.js.map