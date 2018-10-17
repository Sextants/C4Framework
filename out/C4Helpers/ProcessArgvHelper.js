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
const c4utils_1 = require("c4utils");
const Process = require("process");
/**
 * 处理命令行输入
 * 支持的标准的输入参数有：
 * -Version=d.d.xxx
 * -InstanceID=xxxx
 * -Profiles=dev/prod/test
 * -Desc=xxxx
 * -ConfigLabel=xxxx
 * -Labels=xxx,ooo
 * -Host=xxxxx
 * -Port=1111
 * --Debug
 * 自定义输入参数格式：
 * key=value
 * @param c4 C4Framework
 */
function ProcessArgvHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        let Argv = Process.argv;
        if (Argv.length <= 2) {
            return true;
        }
        let CurAppInfo = c4.getAppInfo();
        for (let i = 2; i < Argv.length; i++) {
            let IsVesrion = Argv[i].match(/^-Version=\d+\.\d+\.\S+$/g);
            let IsInstanceID = Argv[i].match(/^-InstanceID=\S+/g);
            let IsProfiles = Argv[i].match(/^-Profiles=\S+/g);
            let IsDesc = Argv[i].match(/^-Desc=[\S\s]+/g);
            let IsConfigLable = Argv[i].match(/^-ConfigLabel=[\S]+/g);
            let IsLabels = Argv[i].match(/^-Labels=[^,]+\S+,*/g);
            let IsHost = Argv[i].match(/^-Host=[\S]+/g);
            let IsPort = Argv[i].match(/^-Port=[\d]+/g);
            let IsDebug = Argv[i].match(/^--Debug/g);
            if (IsVesrion || IsInstanceID || IsProfiles || IsDesc
                || IsLabels || IsConfigLable || IsHost || IsPort
                || IsDebug) {
                if (IsVesrion && CurAppInfo.Version === "") {
                    let CurVersion = Argv[i].replace(/^-Version=/g, "");
                    if (CurVersion) {
                        CurAppInfo.Version = CurVersion;
                    }
                }
                else if (IsInstanceID && CurAppInfo.InstanceID === "") {
                    let CurInstanceID = Argv[i].replace(/^-InstanceID=/g, "");
                    if (CurInstanceID) {
                        CurAppInfo.InstanceID = CurInstanceID;
                    }
                }
                else if (IsProfiles && c4.getProfiles() === "") {
                    let CurProfiles = Argv[i].replace(/^-Profiles=/g, "");
                    if (CurProfiles
                        && (CurProfiles === "dev"
                            || CurProfiles === "prod"
                            || CurProfiles === "staging")) {
                        c4.setProfiles(CurProfiles);
                    }
                }
                else if (IsLabels && CurAppInfo.Labels.length === 0) {
                    let CurLabels = Argv[i].replace(/^Labels=/g, "");
                    let Labels = CurLabels.split(',');
                    for (let j = 0; j < Labels.length; j++) {
                        if (Labels[j]
                            && Labels[j] !== "") {
                            CurAppInfo.Labels.push(Labels[j]);
                        }
                    }
                }
                else if (IsDesc && CurAppInfo.Desc === "") {
                    let CurDesc = Argv[i].replace(/^-Desc=/g, "");
                    if (CurDesc) {
                        CurAppInfo.Desc = CurDesc;
                    }
                }
                else if (IsConfigLable && CurAppInfo.ConfigLabel === "") {
                    let CurLabel = Argv[i].replace(/^-ConfigLabel=/g, "");
                    if (CurLabel) {
                        CurAppInfo.ConfigLabel = CurLabel;
                    }
                }
                else if (IsHost && CurAppInfo.Host === "") {
                    let CurHost = Argv[i].replace(/^-Host=/g, "");
                    if (CurHost) {
                        CurAppInfo.Host = CurHost;
                    }
                }
                else if (IsPort && CurAppInfo.Port === 0) {
                    let CurPort = Argv[i].replace(/^-Port=/g, "");
                    if (CurPort) {
                        CurAppInfo.Port = parseInt(CurPort);
                    }
                }
                else if (IsDebug) {
                    c4.setDebug(true);
                }
            }
            else {
                let TempArgv = c4.getArgv();
                let CurArg = Argv[i].split("=");
                if (c4utils_1.TypeUtils.isArray(CurArg)) {
                    if (CurArg.length >= 2) {
                        let Key = CurArg[0];
                        let Value = "";
                        for (let j = 1; j < CurArg.length; j++) {
                            if (j > 1) {
                                Value += "=";
                            }
                            Value += CurArg[j];
                        }
                        TempArgv[Key] = Value;
                    }
                    else {
                        TempArgv[CurArg[0]] = true;
                    }
                }
                c4.setArgv(TempArgv);
            }
        }
        c4.setAppInfo(CurAppInfo);
        return true;
    });
}
exports.default = ProcessArgvHelper;
//# sourceMappingURL=ProcessArgvHelper.js.map