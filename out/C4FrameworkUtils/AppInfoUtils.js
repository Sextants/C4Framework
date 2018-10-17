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
const c4utils_1 = require("c4utils");
const Path = require("path");
const uuidv4 = require("uuid/v4");
const Yaml = require("js-yaml");
function AppInfoMerage(src1, src2) {
    let MerageRes = JSON.parse(JSON.stringify(src1));
    for (let key in MerageRes) {
        if (key === "Labels") {
            if (MerageRes.Labels.length === 0) {
                MerageRes.Labels = src2.Labels;
            }
        }
        else if (key === "Port") {
            if (MerageRes.Port === 0) {
                MerageRes.Port = src2.Port;
            }
        }
        else if (key === "InstanceID") {
            if (MerageRes.InstanceID === "") {
                if (src2.InstanceID === "") {
                    // 没有InstanceID，生成
                    MerageRes.InstanceID = uuidv4();
                }
                else {
                    MerageRes.InstanceID = src2.InstanceID;
                }
            }
        }
        else {
            if (MerageRes[key] === "") {
                MerageRes[key] = src2[key];
            }
        }
    }
    return MerageRes;
}
exports.AppInfoMerage = AppInfoMerage;
function ValidateAppInfo(Checker, schemaID, appInfo) {
    if (null !== Checker) {
        let Res = Checker.validate(schemaID, appInfo);
        return Res;
    }
    else {
        return false;
    }
}
exports.ValidateAppInfo = ValidateAppInfo;
function DumpAppInfo(appInfo, type, path) {
    return __awaiter(this, void 0, void 0, function* () {
        // Exists and 
        let DumpPath = Path.parse(path);
        let PathStat = yield c4utils_1.FSP.Stat(DumpPath.dir).catch((err) => {
            return null;
        });
        if (null === PathStat) {
            return false;
        }
        if (PathStat.isFile()) {
            return false;
        }
        let WritePath = DumpPath.dir + "/" + DumpPath.name + "." + type;
        if (type === c4configger_1.C4ConfigFileType.Yaml
            || type === c4configger_1.C4ConfigFileType.Yml) {
            yield c4utils_1.FSP.WriteFile(WritePath, Yaml.safeDump(appInfo));
        }
        else if (type == c4configger_1.C4ConfigFileType.JSON) {
            yield c4utils_1.FSP.WriteFile(WritePath, JSON.stringify(appInfo, null, 4));
        }
        return true;
    });
}
exports.DumpAppInfo = DumpAppInfo;
function Sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    });
}
exports.Sleep = Sleep;
//# sourceMappingURL=AppInfoUtils.js.map