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
import { C4LocalLoader, C4YamlLoader, C4JSONLoader, C4ConfiggerOptions } from 'c4configger';
import { TypeUtils } from 'c4utils';
import { FSP } from 'c4utils';

const s_DefaultHelpersConfigPath    = './Config/C4Helpers.yml';
const s_HelpersLoadPaths            = [
    './node_modules/c4framework/out/C4Helpers/',
    './out/C4Helpers/'
]

export async function C4InitFlow(helpersName : string[]) {

    // 初始化一个Config的LocalLoader
    let CurLoaclLoader = new C4LocalLoader();
    CurLoaclLoader.init();
    CurLoaclLoader.registerLoader('.yml', () => {
        return new C4YamlLoader();
    });
    CurLoaclLoader.registerLoader('.yaml', () => {
        return new C4YamlLoader();
    });
    CurLoaclLoader.registerLoader('.json', () => {
        return new C4JSONLoader();
    });

    let TempConfigInfo : C4ConfiggerOptions = {
        ConfigDir : {
            Path : "",
            main : ""
        },
        AppName : "",
        Version : "",
        host : "",
        port : 0,
        InstanceID : "",
        Profiles : "",
        Macros : []
    };
    let HelpersName = await CurLoaclLoader.load(process.cwd(),
        s_DefaultHelpersConfigPath,
        TempConfigInfo).catch((err) => {
        console.log(err);
        return null;
    });

    if (TypeUtils.isEmptyObj(HelpersName)
        || !TypeUtils.isArray(HelpersName.C4Helpers)
        || (HelpersName.C4Helpers.length > 0 && !TypeUtils.isString(HelpersName.C4Helpers[0]))) {
        console.log("C4Helper get a bad format config.");
        process.exit(-1);
    }

    if (TypeUtils.isEmptyArray(HelpersName.C4Helpers)) {
        console.warn("Warning : C4Helper get a empty config.");
    }

    for (let i = 0; i < HelpersName.C4Helpers.length; i++) {
        helpersName.push(HelpersName.C4Helpers[i]);
    }

    let Helpers : any[] = [];
    try {
        Helpers = FSP.getModulesEx(
            // HelpersName.C4Helpers,
            helpersName,
            // [ s_HelpersLoadPath ],
            s_HelpersLoadPaths,
            "",
            true);
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }

    return Helpers;
}
