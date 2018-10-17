import { DumpAppInfo }      from '../C4FrameworkUtils/AppInfoUtils';
import { ApplicationInfoPath } from '../C4FrameworkTypes/C4ApplicationInfo';
import { C4ConfigFileType } from 'c4configger';
import C4Framework          from '../C4Framework'
import { C4Logger }         from 'c4logger';

/**
 * 将AppInfo dump回配置文件
 * Path：./temp/.App.json
 * @param c4 C4Framework
 */
export default async function DumpAppInfoHelper(c4 : C4Framework) {
    let CurAppInfo = c4.getAppInfo();
    let DumpRes = await DumpAppInfo(CurAppInfo, C4ConfigFileType.JSON, ApplicationInfoPath);
    if (DumpRes === false) {
        (<C4Logger>c4.getLogger()).err("Dump Application Info failed.");
        return false;
    }
    return true;
}
