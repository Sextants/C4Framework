import { FSP }              from 'c4utils';
import C4ApplicationInfo    from '../C4FrameworkTypes/C4ApplicationInfo';
import { ApplicationInfoPath } from '../C4FrameworkTypes/C4ApplicationInfo';
import { AppInfoMerage }    from '../C4FrameworkUtils/AppInfoUtils';
import C4Framework          from '../C4Framework'
import { C4Logger }         from 'c4logger';

import Path                 = require('path');
import StripJsonComments    = require('strip-json-comments');

/**
 * 加载AppInfo
 * 会与从命令行参数加载的AppInfo信息进行合并
 * 优先使用命令行参数中的配置
 * @param c4 C4Framework
 */
export default async function AppInfoHelper(c4 : C4Framework) {
    let AppInfo : C4ApplicationInfo;
    try {
        let Doc = await FSP.ReadFile(Path.join(process.cwd(), ApplicationInfoPath), {
            encoding    : 'utf8',
            flag        : 'r'
        });

        AppInfo = JSON.parse(StripJsonComments(<string>Doc));

        let TempInfo = AppInfoMerage(c4.getAppInfo(), AppInfo);
        c4.setAppInfo(TempInfo);
    } catch (error) {
        (<C4Logger>c4.getLogger()).debug(error);
        return false;
    }
    return true;
}
