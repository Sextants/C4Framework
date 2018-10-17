export default class StatusController {
    static Status(): {
        code: number;
        msg: string;
        data: {
            Status: import("../C4FrameworkTypes/C4ApplicationInfo").AppStatus;
        };
    };
}
