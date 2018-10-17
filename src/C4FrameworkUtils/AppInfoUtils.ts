
import C4AJV                from 'c4ajv';
import C4ApplicationInfo    from '../C4FrameworkTypes/C4ApplicationInfo';
import { C4ConfigFileType } from 'c4configger';
import { FSP }              from 'c4utils';

import Path     = require('path');
import uuidv4   = require('uuid/v4');
import Yaml     = require('js-yaml');

export function AppInfoMerage(src1 : C4ApplicationInfo, src2 : C4ApplicationInfo | any) {
    let MerageRes : C4ApplicationInfo | any = JSON.parse(JSON.stringify(src1));
    for (let key in MerageRes) {
        if (key === "Labels") {
            if (MerageRes.Labels.length === 0) {
                MerageRes.Labels = src2.Labels;
            }
        } else if (key === "Port") {
            if (MerageRes.Port === 0) {
                MerageRes.Port = src2.Port;
            }
        } else if (key === "InstanceID") {
            if (MerageRes.InstanceID === "") {
                if (src2.InstanceID === "") {
                    // 没有InstanceID，生成
                    MerageRes.InstanceID = uuidv4();
                } else {
                    MerageRes.InstanceID = src2.InstanceID;
                }
            }
        } else {
            if (MerageRes[key] === "") {
                MerageRes[key] = src2[key];
            }
        }
    }

    return MerageRes;
}

export function ValidateAppInfo(Checker : C4AJV, schemaID : string, appInfo : C4ApplicationInfo) {
    if (null !== Checker) {
        let Res = Checker.validate(schemaID, appInfo);
        return Res;
    } else {
        return false;
    }
}

export async function DumpAppInfo(appInfo : C4ApplicationInfo, type : C4ConfigFileType, path : string) {
    // Exists and 
    let DumpPath = Path.parse(path);
    let PathStat = await FSP.Stat(DumpPath.dir).catch((err) => {
        return null;
    });
    if (null === PathStat) {
        return false;
    }
    if (PathStat.isFile()) {
        return false;
    }

    let WritePath = DumpPath.dir + "/" + DumpPath.name + "." + type;
    if (type === C4ConfigFileType.Yaml
        || type === C4ConfigFileType.Yml) {
        await FSP.WriteFile(WritePath, Yaml.safeDump(appInfo));
    } else if (type == C4ConfigFileType.JSON) {
        await FSP.WriteFile(WritePath, JSON.stringify(appInfo, null, 4));
    }

    return true;
}

export async function Sleep(ms : number) {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
