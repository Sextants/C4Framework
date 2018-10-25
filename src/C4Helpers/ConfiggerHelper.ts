import C4Framework          from '../C4Framework';
import C4AJV                from 'c4ajv';
import { C4Configger }      from 'c4configger';
import { C4Logger }         from 'c4logger';
import { ValidateAppInfo }  from '../C4FrameworkUtils/AppInfoUtils';
import C4ApplicationInfo    from '../C4FrameworkTypes/C4ApplicationInfo';
import { TypeUtils } from 'c4utils/out';

const ConfiggerConfigPath       = './Config/Configger.yml';
const ApplicationInfoSechema    = "http://sextants/C4Framework/ApplicationInfo.json";

async function initConfigger(c4 : C4Framework) {
    if (c4.getConfigger() === null) {
        let CurAppInfo = (<C4ApplicationInfo>c4.getAppInfo());
        let Configger = new C4Configger({
            AppName     : CurAppInfo.AppName,
            Version     : CurAppInfo.Version,
            host        : CurAppInfo.Host,
            port        : CurAppInfo.Port,
            InstanceID  : CurAppInfo.InstanceID,
            Profiles    : "",
            Label       : CurAppInfo.ConfigLabel,
            Checker     : <C4AJV>c4.getChecker(),
            ConfigPath  : ConfiggerConfigPath
        });

        try {
            await Configger.init();
            c4.setConfigger(Configger);
            return true;
        } catch (error) {
            (<C4Logger>c4.getLogger()).err(error);
            return false;
        }
    }
    return true;
}

/**
 * 初始化Configger
 * 根据配置从本地或远程源加载配置
 * 加载完毕后配置存储在C4Configger的静态成员变量g_Config中
 * @param c4 C4Framework
 */
export default async function ConfiggerHelper(c4 : C4Framework) {
    let Res = await initConfigger(c4);
    if (!Res) {
        return Res;
    }

    let ConfiggerLoadType = (<C4Configger>c4.getConfigger()).loadType();
    if (ConfiggerLoadType === "Remote" || ConfiggerLoadType === "Local") {
        let ValidRes = ValidateAppInfo(<C4AJV>c4.getChecker(), ApplicationInfoSechema, c4.getAppInfo());
        if (ValidRes === false) {
            (<C4Logger>c4.getLogger()).err("Invalid Application Info.");
            c4.setConfigger(null);
            return false;
        }
    } else {
        (<C4Logger>c4.getLogger()).err("Unknown Configger load type, may configger init failed.");
        c4.setConfigger(null);
        return false;
    }

    await (<C4Configger>c4.getConfigger()).load();

    let ConfigHook = c4.getConfigHook();
    if (ConfigHook && TypeUtils.isFunction(ConfigHook)) {
      await ConfigHook(c4);
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
}
