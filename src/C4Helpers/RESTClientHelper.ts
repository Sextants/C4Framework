import C4Framework from "..";
import { TypeUtils, PathUtils, FSP } from "c4utils";
import glob = require("glob");
import Path = require('path');
import { C4Logger } from "c4logger";
import { C4RESTFulParser, C4RESTFulClient, ClientOption } from "c4restfulclient";
var RedisCookieStore = require('redis-cookie-store');

const ParserDir : string[] = [
    './RESTClientParsers',
    './out/RESTClientParsers'
];

function LoadRESTClientParser(name : string) {
    if (!TypeUtils.isString(name)
        || TypeUtils.isEmptyStr(name)
    ) {
        return undefined;
    }

    for (let i = 0; i < ParserDir.length; i++) {
        if (glob.hasMagic(name))
            return undefined;

        let parsedFile  = Path.parse(name);
        let curPath     = Path.join(parsedFile.dir, parsedFile.name);
        let fullPath    = Path.join(process.cwd(), ParserDir[i], curPath + '.*');
        let IsInside    = PathUtils.PathInside(process.cwd(), fullPath);
        if (!IsInside) {
            continue;
        }

        return <C4RESTFulParser>FSP.getModules([fullPath], "", false)[0];
    }

    return undefined;
}

/**
 * 初始化RESTClient
 * @param c4 C4Framework
 */
export default async function RESTClientHelper(c4 : C4Framework) {

    (<C4Logger>c4.getLogger()).debug('RESTClientHelper in');
    /**
     * TODO: 增加对应的校验schema配置
     */
    //check

    let RESTClientConfig = C4Framework.getConfig()["RESTClient"];
    if (TypeUtils.isObject(RESTClientConfig)
        && !TypeUtils.isEmptyObj(RESTClientConfig)) {

        let ParsersConfig   = RESTClientConfig.parsers;
        delete RESTClientConfig.parsers;

        if (RESTClientConfig['cookiesOption']
            && RESTClientConfig['cookiesOption'].enabled === true) {
            if (RESTClientConfig['cookiesOption'].store) {
                let IsClientRef = RESTClientConfig['cookiesOption'].store.match(/^{Redis:[\S\s]+}$/g);
                if (IsClientRef === null) {
                    (<C4Logger>c4.getLogger()).err('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                        + 'but client format error. Cur store client config is : %s.', RESTClientConfig['cookiesOption'].store + '.');
                    throw new Error('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                        + 'but client format error. Cur store client config is : ' + RESTClientConfig['cookiesOption'].store + '.')
                }

                let CurRedisClientName  = RESTClientConfig['cookiesOption'].store.replace(/^{Redis:[\s]*/g, '').replace(/[\s]*}$/g, '');
                let CurRedisClient      = c4.getRedisClient(CurRedisClientName);
                if (TypeUtils.isEmptyObj(CurRedisClient)) {
                    (<C4Logger>c4.getLogger()).err('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                        + 'but can\'t find client. Cur store client config is : %s.', RESTClientConfig['cookiesOption'].sotre);
                    throw new Error('ProcessRESTClientConfig failed, cookies store type is "Redis", '
                        + 'but can\'t find client. Cur store client config is : ' + RESTClientConfig['cookiesOption'].sotre + '.');
                }

                let CurCookieStore = new RedisCookieStore(CurRedisClient, c4.getAppInfo().AppName + '-cokkie-store');
                RESTClientConfig['cookiesOption'].store = CurCookieStore;
            }
        }

        let CurClient   = c4.getRESTClient();
        if (CurClient === null) {
            // RESTClient没有初始化，在这里初始化
            CurClient = new C4RESTFulClient();
            await CurClient.init(<ClientOption>RESTClientConfig);
            c4.setRESTClient(CurClient);
        }

        // 加载Parsers
        if (TypeUtils.isArray(ParsersConfig)
            && !TypeUtils.isEmptyArray(ParsersConfig)){
            for (let i = 0; i < RESTClientConfig.length; i++) {
                let CurConfig = RESTClientConfig[i];
                let CurParserName = CurConfig.parserName;
                let CurParserPath = CurConfig.parser;
                let TempParsers = FSP.getModulesEx(CurParserPath,
                    ['./RESTClientParsers',
                    './out/RESTClientParsers'],
                    "", true);
                if (!TypeUtils.isArray(TempParsers)
                    || TypeUtils.isEmptyArray(TempParsers)) {
                    (<C4Logger>c4.getLogger()).err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                    throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                }
                let CurParser = <C4RESTFulParser>(TempParsers[0])
                // let CurParser = LoadRESTClientParser(CurParserPath);
                if (CurParser === undefined) {
                    (<C4Logger>c4.getLogger()).err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                    throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed.`);
                }
                if (CurParserName !== CurParser.name) {
                    (<C4Logger>c4.getLogger()).err(`RESTClientHelper load RESTClientParser ${CurParserPath} failed, want name: ${CurParserName}, cur name: ${CurParser.name}.`);
                    throw new Error(`RESTClientHelper load RESTClientParser ${CurParserPath} failed, want name: ${CurParserName}, cur name: ${CurParser.name}.`);
                }

                CurClient.addParser(CurParser);
            }
        }

        (<C4Logger>c4.getLogger()).debug('RESTClientHelper init finished.');
    } else {
        (<C4Logger>c4.getLogger()).debug('RESTClientHelper no init.');
    }

    return true;
}
