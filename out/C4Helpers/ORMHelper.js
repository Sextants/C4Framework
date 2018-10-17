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
const C4Framework_1 = require("../C4Framework");
const c4utils_1 = require("c4utils");
const sequelize_typescript_1 = require("sequelize-typescript");
const glob = require("glob");
const Path = require("path");
// { dir : 'path'}
// 
function getModels(arg, debug = false) {
    // 输入无效
    if (!c4utils_1.TypeUtils.isArray(arg)
        || arg.length == 0) {
        return {
            models: [],
            syncForces: []
        };
    }
    let TargetDir = [
        './DAO/',
        './out/DAO/'
    ];
    let Models = {
        models: [],
        syncForces: []
    };
    for (let j = 0; j < TargetDir.length; j++) {
        for (let i = 0; i < arg.length; i++) {
            let CurForce;
            let CurLoadPath;
            if (arg[i].Dir) {
                let CurDir = arg[i].Dir;
                CurForce = arg[i].syncForce;
                if (c4utils_1.TypeUtils.isString(CurDir)
                    && !c4utils_1.TypeUtils.isEmptyStr(CurDir)) {
                    let parsedFile = Path.parse(CurDir);
                    let curPath = Path.join(parsedFile.dir, parsedFile.name);
                    if (!glob.hasMagic(CurDir)) {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath, '*.*');
                    }
                    else {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath);
                    }
                    let IsInside = c4utils_1.PathUtils.PathInside(process.cwd(), CurLoadPath);
                    if (!IsInside)
                        continue;
                }
                else {
                    continue;
                }
            }
            else if (arg[i].Name) {
                let CurName = arg[i].Name;
                CurForce = arg[i].syncForce;
                if (c4utils_1.TypeUtils.isString(CurName)
                    && !c4utils_1.TypeUtils.isEmptyStr(CurName)) {
                    let parsedFile = Path.parse(CurName);
                    let curPath = Path.join(parsedFile.dir, parsedFile.name);
                    if (!glob.hasMagic(CurName)) {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath + '.*');
                    }
                    else {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath);
                    }
                    let IsInside = c4utils_1.PathUtils.PathInside(process.cwd(), CurLoadPath);
                    if (!IsInside)
                        continue;
                }
                else {
                    continue;
                }
            }
            else {
                continue;
            }
            let CurModels = c4utils_1.FSP.getModules([CurLoadPath], "", debug);
            if (CurModels.length > 0) {
                Models.models = Models.models.concat(CurModels);
                // Models.models.push(CurModels);
                Models.syncForces.push({
                    begin: Models.models.length - CurModels.length,
                    count: CurModels.length,
                    force: CurForce
                });
            }
        }
    }
    return Models;
}
/**
 * 初始化数据库连接同时初始化对应的DAOs
 * @param c4 C4Framework
 */
function ORMHelper(c4) {
    return __awaiter(this, void 0, void 0, function* () {
        c4.getLogger().debug('ORMHelper in');
        let DBClients = c4.getDBClients();
        let CurConfig = C4Framework_1.default.getConfig();
        if (c4utils_1.TypeUtils.isEmptyObj(CurConfig.DBClients)) {
            c4.getLogger().debug('ORMHelper no DAO init.');
            return true;
        }
        /**
         * TODO: 增加对应的校验schema配置
         */
        // check
        for (let i = 0; i < CurConfig.DBClients.length; i++) {
            let CurDBConfig = CurConfig.DBClients[i];
            if (!DBClients.has(CurDBConfig.name)) {
                let CurInstance = new sequelize_typescript_1.Sequelize(CurDBConfig.config);
                let CurModels = getModels(CurDBConfig.DAOs);
                CurInstance.addModels(CurModels.models);
                for (let i = 0; i < CurModels.syncForces.length; i++) {
                    let ForceRange = CurModels.syncForces[i];
                    for (let j = 0; j < ForceRange.count; j++) {
                        yield CurModels.models[j + ForceRange.begin].sync({
                            force: ForceRange.force
                        });
                    }
                }
                DBClients.set(CurDBConfig.name, CurInstance);
            }
        }
        c4.getLogger().debug('ORMHelper init DAO finished.');
        return true;
    });
}
exports.default = ORMHelper;
//# sourceMappingURL=ORMHelper.js.map