export enum LogLevel {
  Silent,
  Error,
  Warn,
  Info,
  Debug,
}

type LogFn = (level: LogLevel, ...message: any[]) => void;

interface ReporterOptions {
  level?: LogLevel;
  log: LogFn;
}

class Reporter {

  public level: LogLevel;
  public log: LogFn

  public constructor(options: ReporterOptions) {
    this.level = options.level || LogLevel.Info;
    this.log = options.log;
  }

}

const reporters: Reporter[] = [];

const log: LogFn = (level, ...message) => {
  reporters.forEach(reporter => {
    if (reporter.level >= level) { reporter.log(level, ...message); }
  });
};

export function addReporter(options: ReporterOptions) {
  const reporter = new Reporter(options);
  reporters.push(reporter);
  return reporter;
}

export default {
  error: log.bind(null, LogLevel.Error),
  warn: log.bind(null, LogLevel.Warn),
  info: log.bind(null, LogLevel.Info),
  debug: log.bind(null, LogLevel.Debug),
};
