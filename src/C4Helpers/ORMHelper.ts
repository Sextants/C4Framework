import C4Framework      from '../C4Framework';
import { C4Logger }     from 'c4logger';
import {
    DialectType, TransactionIsolationLevel,
    TransactionType, PoolOptions,
    DBConnectionConfig
} from 'c4orm';

import { TypeUtils, FSP, PathUtils } from 'c4utils';
import { Sequelize, IsIn } from 'sequelize-typescript';
import glob         = require('glob');
import Path = require('path');

type DAOPathOption = {
    Dir : string;
    syncForce : boolean
};

type DAOOption = {
    Name : string;
    syncForce : boolean
}

// { dir : 'path'}
// 
function getModels(arg : Array<DAOPathOption | DAOOption>,
    debug : boolean = false) {
    // 输入无效
    if (!TypeUtils.isArray(arg)
        || arg.length == 0) {
        return {
            models : [],
            syncForces : []
        };
    }

    let TargetDir = [
        './DAO/',
        './out/DAO/'
    ]

    let Models : {
        models : any[];
        syncForces : any[]
    } = {
        models : [],
        syncForces : []
    };
    for (let j = 0; j < TargetDir.length; j++) {
        for (let i = 0; i < arg.length; i++) {
            let CurForce;
            let CurLoadPath : string; 
            if ((<DAOPathOption>arg[i]).Dir) {
                let CurDir  = (<DAOPathOption>arg[i]).Dir;
                CurForce= (<DAOPathOption>arg[i]).syncForce;
                if (TypeUtils.isString(CurDir)
                    && !TypeUtils.isEmptyStr(CurDir)) {
                    let parsedFile  = Path.parse(CurDir);
                    let curPath     = Path.join(parsedFile.dir, parsedFile.name);
                    if (!glob.hasMagic(CurDir)) {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath, '*.*');
                    } else {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath);
                    }
                    let IsInside = PathUtils.PathInside(process.cwd(), CurLoadPath);
                    if (!IsInside) continue;
                } else {
                    continue;
                }
            } else if ((<DAOOption>arg[i]).Name) {
                let CurName = (<DAOOption>arg[i]).Name;
                CurForce= (<DAOOption>arg[i]).syncForce;
                if (TypeUtils.isString(CurName)
                    && !TypeUtils.isEmptyStr(CurName)) {
                    let parsedFile  = Path.parse(CurName);
                    let curPath     = Path.join(parsedFile.dir, parsedFile.name);
                    if (!glob.hasMagic(CurName)) {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath + '.*');
                    } else {
                        CurLoadPath = Path.join(process.cwd(), TargetDir[j], curPath);
                    }
                    let IsInside = PathUtils.PathInside(process.cwd(), CurLoadPath);
                    if (!IsInside) continue;
                } else {
                    continue;
                }
            } else {
                continue;
            }
    
            let CurModels = FSP.getModules([CurLoadPath], "", debug);
            if (CurModels.length > 0) {
                Models.models = Models.models.concat(CurModels);
                // Models.models.push(CurModels);
                Models.syncForces.push({
                    begin : Models.models.length - CurModels.length,
                    count : CurModels.length,
                    force : CurForce
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
export default async function ORMHelper(c4 : C4Framework) {
    (<C4Logger>c4.getLogger()).debug('ORMHelper in');
    let DBClients  = c4.getDBClients();
    let CurConfig   = C4Framework.getConfig();
    if (TypeUtils.isEmptyObj(CurConfig.DBClients)) {
        (<C4Logger>c4.getLogger()).debug('ORMHelper no DAO init.');
        return true;
    }

    /**
     * TODO: 增加对应的校验schema配置
     */
    // check
    for (let i = 0; i < CurConfig.DBClients.length; i++) {
        let CurDBConfig = CurConfig.DBClients[i];
        if (!DBClients.has(CurDBConfig.name)) {
            let CurInstance = new Sequelize(CurDBConfig.config);
            let CurModels = getModels(CurDBConfig.DAOs);
            CurInstance.addModels(CurModels.models);
            for (let i = 0; i < CurModels.syncForces.length; i++) {
                let ForceRange = CurModels.syncForces[i];
                for (let j = 0; j < ForceRange.count; j++) {
                    await CurModels.models[j + ForceRange.begin].sync({
                        force : ForceRange.force
                    });
                }
            }

            DBClients.set(CurDBConfig.name, CurInstance);
        }
    }

    (<C4Logger>c4.getLogger()).debug('ORMHelper init DAO finished.');

    return true;
}
