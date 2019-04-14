import getOptions from 'getopts';
import { bold, dim, magenta, cyan, yellow, red } from 'kleur';
import { bin, description, version } from '../package.json';
import { report } from './lib/report';
import log, { addReporter, LogLevel } from './lib/log';
import { AppError } from './lib/Error';

class UsageError<T> extends AppError<T> {}

const usage = `Usage: ${magenta(`${Object.keys(bin)[0]} [options]`)}

  ${description}

${bold('Available options:')}

  ${cyan('--title')}        Issue title                              ${yellow('string')}
  ${cyan('--package')}      The (npm) package the error occured in   ${yellow('string')}
  ${cyan('--template')}     The issue template to use                ${yellow('string')}
  ${cyan('--print-url')}    Just print the URL to open              ${yellow('boolean')}
  ${cyan('--verbose')}      Additinal logging                       ${yellow('boolean')}
  ${cyan(`--version, ${dim('-v')}`)}  Print version                           ${yellow('boolean')}
  ${cyan(`--help, ${dim('-h')}`)}     Show this help                          ${yellow('boolean')}
`;

type CliOptions = {
  title?: string;
  template?: string;
  package?: string;
  ['print-url']: boolean;

  verbose?: boolean;
  help?: boolean;
  version?: boolean;
}

export default async function runCli(args = process.argv.slice(2)) {
  const reporter = addReporter({
    log(level, ...message) {
      // eslint-disable-next-line no-console
      (console[level === LogLevel.Error ? 'error' : 'log'])(...message);
    },
  });
  const options: CliOptions = getOptions(args, {
    string: [
      'title',
      'package',
      'template',
      'repo',
    ],
    boolean: [
      'help',
      'version',
      'print-url',
      'verbose',
    ],
    alias: {
      h: 'help',
      v: 'version',
    },
    unknown(option) {
      throw new UsageError(`Unknown option '${option}'`, { args });
    },
  });

  if (options.verbose) {
    reporter.level = LogLevel.Debug;
  }

  if (options.help) {
    return log.info(usage);
  }

  if (options.version) {
    return log.info(version);
  }

  const url = await report({
    ...options,
    open: !options['print-url'],
  });

  if (options['print-url']) {
    log.info(url);
  }

  return url;
}

if (!module.parent) {
  runCli()
    .catch(error => {
      if (error instanceof AppError) {
        if (error instanceof UsageError) {
          log.info(usage);
        }
        log.error(red(error.message));
        log.debug(error.stack);
      } else {
        log.error(error);
      }

      process.exitCode = 1;
    });
}
