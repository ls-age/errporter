export declare class AppError<T extends {}> extends Error {
    info: T;
    static from<T>(error: Error, info: T): AppError<T>;
    constructor(message: string, info: T);
}
export declare class UsageError extends AppError<{}> {
}
