export declare enum LogLevel {
    Silent = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4
}
declare type LogFn = (level: LogLevel, ...message: any[]) => void;
interface ReporterOptions {
    level?: LogLevel;
    log: LogFn;
}
declare class Reporter {
    level: LogLevel;
    log: LogFn;
    constructor(options: ReporterOptions);
}
export declare function addReporter(options: ReporterOptions): Reporter;
declare const _default: {
    error: any;
    warn: any;
    info: any;
    debug: any;
};
export default _default;
