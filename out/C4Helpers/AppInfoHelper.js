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
const C4ApplicationInfo_1 = require("../C4FrameworkTypes/C4ApplicationInfo");
const AppInfoUtils_1 = require("../C4FrameworkUtils/AppInfoUtils");
const Path = require("path");
const StripJsonComments = require("strip-json-comments");
/**
 * 加载AppInfo
 * 会与从命令行参数加载的AppInfo信息进行合并
 * 优先使用命令行参数中的配置
 * @param c4 C4Framework
 */
function AppInfoHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        let AppInfo;
        try {
            let Doc = yield c4utils_1.FSP.ReadFile(Path.join(process.cwd(), C4ApplicationInfo_1.ApplicationInfoPath), {
                encoding: 'utf8',
                flag: 'r'
            });
            AppInfo = JSON.parse(StripJsonComments(Doc));
            let TempInfo = AppInfoUtils_1.AppInfoMerage(c4.getAppInfo(), AppInfo);
            c4.setAppInfo(TempInfo);
        }
        catch (error) {
            c4.getLogger().debug(error);
            return false;
        }
        return true;
    });
}
exports.default = AppInfoHelper;
//# sourceMappingURL=AppInfoHelper.js.map