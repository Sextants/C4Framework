import { C4Logger }         from 'c4logger';
import C4Framework          from '../C4Framework';
import { TypeUtils, FSP }   from 'c4utils';
import C4AJV                from 'c4ajv';

import Yaml                 = require('js-yaml');

const LoggerConfigPath      = './Config/C4Logger.yml';
const LoggerConfigSechema   = "http://sextants/C4Framework/LoggerConfig.json";

/**
 * 初始化Logger
 * @param c4 C4Framework
 */
export default async function LoggerHelper(c4 : C4Framework) {
    if (null == c4.getLogger()) {
        // 加载日志配置
        let doc = null;
        try {
            let data = await FSP.ReadFile(LoggerConfigPath, {
                encoding : 'utf8',
                flag : 'r'
            });

            doc = Yaml.safeLoad(<string>data);
            if (TypeUtils.isEmptyObj(doc)) {
                throw new Error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Logger config is empty.");
            }
        } catch (error) {
            console.error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Load logger config failed.");
            console.log(error);
            return false;
        }

        if (null !== c4.getChecker()) {
            let Res = (<C4AJV>c4.getChecker()).validate(LoggerConfigSechema, <object>doc);
            if (Res === false) {
                console.error("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] Invalid logger config file.");
                return false;
            }
        } else {
            console.warn("[" + (new Date()).toLocaleString() + "]" + ' [C4Framework] JSON checker not init, can not check logger config.');
        }

        console.debug("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] init logger...");
        let Logger = new C4Logger();
        await Logger.init(<any>doc);
        c4.setLogger(Logger);
        console.debug("[" + (new Date()).toLocaleString() + "]" + " [C4Framework] init logger succeed.");
    }

    return true;
}
