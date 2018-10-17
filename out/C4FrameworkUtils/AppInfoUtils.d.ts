import C4AJV from 'c4ajv';
import C4ApplicationInfo from '../C4FrameworkTypes/C4ApplicationInfo';
import { C4ConfigFileType } from 'c4configger';
export declare function AppInfoMerage(src1: C4ApplicationInfo, src2: C4ApplicationInfo | any): any;
export declare function ValidateAppInfo(Checker: C4AJV, schemaID: string, appInfo: C4ApplicationInfo): boolean | PromiseLike<any>;
export declare function DumpAppInfo(appInfo: C4ApplicationInfo, type: C4ConfigFileType, path: string): Promise<boolean>;
export declare function Sleep(ms: number): Promise<void>;
