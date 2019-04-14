#!/usr/bin/env node

import 'path';
import 'new-github-issue-url';
import 'get-pkg-repo';
import 'open';
import 'util';
import 'fs';
import { c as addReporter, d as LogLevel, b as log, a as report, e as AppError } from './chunk-43199bc8.js';
import 'os-name';
import 'execa';
import 'async-replace-es6';
import 'prompts';
import getOptions from 'getopts';
import { magenta, bold, cyan, yellow, dim, red } from 'kleur';

var version = "0.0.0";
var description = "Let users report errors to GitHub";
var bin = {
	errporter: "./out/cjs/cli.js"
};

class UsageError extends AppError {}

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
async function runCli(args = process.argv.slice(2)) {
  const reporter = addReporter({
    log(level, ...message) {
      // eslint-disable-next-line no-console
      console[level === LogLevel.Error ? 'error' : 'log'](...message);
    }

  });
  const options = getOptions(args, {
    string: ['title', 'package', 'template', 'repo'],
    boolean: ['help', 'version', 'print-url', 'verbose'],
    alias: {
      h: 'help',
      v: 'version'
    },

    unknown(option) {
      throw new UsageError(`Unknown option '${option}'`, {
        args
      });
    }

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

  const url = await report({ ...options,
    open: !options['print-url']
  });

  if (options['print-url']) {
    log.info(url);
  }

  return url;
}

if (!module.parent) {
  runCli().catch(error => {
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

export default runCli;
