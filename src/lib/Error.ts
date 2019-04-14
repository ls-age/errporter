export class AppError<T extends {}> extends Error {

  public info: T;

  public static from<T>(error: Error, info: T) {
    const err = new this<T>(error.message, info);
    err.stack = error.stack;

    return err;
  }

  public constructor(message: string, info: T) {
    super(message);

    this.info = info;
  }

}

export class UsageError extends AppError<{}> {}
