
export default interface C4ApplicationInfo {
    AppName     : string;
    Version     : string;
    InstanceID  : string;
    ConfigLabel : string;           // config label
    Labels      : string[];         // labels
    Host        : string;
    Port        : number;           // 用来提供服务状态、日志控制的接口，WebService需要自己设定Port
    Desc        : string;
};

export type AppProfiles = 'dev' | 'prod' | 'staging' | '';
export type AppStatus = "Unknown" | "Initializing" | "Ready" | "Starting" | "Running";
export const ServiceStatus : {
    Status : AppStatus } = {
    Status : "Unknown"
};

export const ApplicationInfoPath   = './.temp/.App.json';

