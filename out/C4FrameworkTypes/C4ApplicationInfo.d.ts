export default interface C4ApplicationInfo {
    AppName: string;
    Version: string;
    InstanceID: string;
    ConfigLabel: string;
    Labels: string[];
    Host: string;
    Port: number;
    Desc: string;
}
export declare type AppProfiles = 'dev' | 'prod' | 'staging' | '';
export declare type AppStatus = "Unknown" | "Initializing" | "Ready" | "Starting" | "Running";
export declare const ServiceStatus: {
    Status: AppStatus;
};
export declare const ApplicationInfoPath = "./.temp/.App.json";
