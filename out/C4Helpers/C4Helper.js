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
// import C4Framework          from '../C4Framework';
// import { ProcessArgvHelper }from './ProcessArgvHelper';
// import { SchemaHelper }     from './SchemaHelper';
// import { LoggerHelper }     from './LoggerHelper';
// import { AppInfoHelper }    from './AppInfoHelper';
// import { ConfiggerHelper }  from './ConfiggerHelper';
// import { DumpAppInfoHelper }from './AppInfoHelper';
// import { RegistryHelper }   from './RegistryHelper';
// import { WebServiceHelper } from './WebServiceHelper';
// import { ORMHelper }        from './ORMHelper';
// import { ROMHelper }        from './ROMHelper';
// import { MQHelper }         from './MQHelper';
// import { LoadBalancerHelper } from './LoadBalancerHelper';
// import { DependenciesHelper, WaitDependenciesReady } from './DependenciesHelper';
// import { RESTClientHelper } from './RESTClientHelper';
const c4configger_1 = require("c4configger");
const c4utils_1 = require("c4utils");
const c4utils_2 = require("c4utils");
const s_DefaultHelpersConfigPath = './Config/C4Helpers.yml';
const s_HelpersLoadPaths = [
    './node_modules/c4framework/out/C4Helpers/',
    './out/C4Helpers/'
];
function C4InitFlow(helpersName) {
    return __awaiter(this, void 0, void 0, function* () {
        // 初始化一个Config的LocalLoader
        let CurLoaclLoader = new c4configger_1.C4LocalLoader();
        CurLoaclLoader.init();
        CurLoaclLoader.registerLoader('.yml', () => {
            return new c4configger_1.C4YamlLoader();
        });
        CurLoaclLoader.registerLoader('.yaml', () => {
            return new c4configger_1.C4YamlLoader();
        });
        CurLoaclLoader.registerLoader('.json', () => {
            return new c4configger_1.C4JSONLoader();
        });
        let TempConfigInfo = {
            ConfigDir: {
                Path: "",
                main: ""
            },
            AppName: "",
            Version: "",
            host: "",
            port: 0,
            InstanceID: "",
            Profiles: "",
            Macros: []
        };
        let HelpersName = yield CurLoaclLoader.load(process.cwd(), s_DefaultHelpersConfigPath, TempConfigInfo).catch((err) => {
            console.log(err);
            return null;
        });
        if (c4utils_1.TypeUtils.isEmptyObj(HelpersName)
            || !c4utils_1.TypeUtils.isArray(HelpersName.C4Helpers)
            || (HelpersName.C4Helpers.length > 0 && !c4utils_1.TypeUtils.isString(HelpersName.C4Helpers[0]))) {
            console.log("C4Helper get a bad format config.");
            process.exit(-1);
        }
        if (c4utils_1.TypeUtils.isEmptyArray(HelpersName.C4Helpers)) {
            console.warn("Warning : C4Helper get a empty config.");
        }
        for (let i = 0; i < HelpersName.C4Helpers.length; i++) {
            helpersName.push(HelpersName.C4Helpers[i]);
        }
        let Helpers = [];
        try {
            Helpers = c4utils_2.FSP.getModulesEx(
            // HelpersName.C4Helpers,
            helpersName, 
            // [ s_HelpersLoadPath ],
            s_HelpersLoadPaths, "", true);
        }
        catch (error) {
            console.log(error);
            process.exit(-1);
        }
        return Helpers;
    });
}
exports.C4InitFlow = C4InitFlow;
//# sourceMappingURL=C4Helper.js.map