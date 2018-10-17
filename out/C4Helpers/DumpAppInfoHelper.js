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
const AppInfoUtils_1 = require("../C4FrameworkUtils/AppInfoUtils");
const C4ApplicationInfo_1 = require("../C4FrameworkTypes/C4ApplicationInfo");
const c4configger_1 = require("c4configger");
/**
 * 将AppInfo dump回配置文件
 * Path：./temp/.App.json
 * @param c4 C4Framework
 */
function DumpAppInfoHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        let CurAppInfo = c4.getAppInfo();
        let DumpRes = yield AppInfoUtils_1.DumpAppInfo(CurAppInfo, c4configger_1.C4ConfigFileType.JSON, C4ApplicationInfo_1.ApplicationInfoPath);
        if (DumpRes === false) {
            c4.getLogger().err("Dump Application Info failed.");
            return false;
        }
        return true;
    });
}
exports.default = DumpAppInfoHelper;
//# sourceMappingURL=DumpAppInfoHelper.js.map