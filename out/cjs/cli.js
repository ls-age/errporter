#!/usr/bin/env node

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('path');
require('new-github-issue-url');
require('get-pkg-repo');
require('open');
require('util');
require('fs');
var __chunk_1 = require('./chunk-1d02dfa9.js');
require('os-name');
require('execa');
require('async-replace-es6');
require('prompts');
var getOptions = _interopDefault(require('getopts'));
var kleur = require('kleur');

var version = "0.0.0";
var description = "Let users report errors to GitHub";
var bin = {
	errporter: "./out/cjs/cli.js"
};

class UsageError extends __chunk_1.AppError {}

const usage = `Usage: ${kleur.magenta(`${Object.keys(bin)[0]} [options]`)}

  ${description}

${kleur.bold('Available options:')}

  ${kleur.cyan('--title')}        Issue title                              ${kleur.yellow('string')}
  ${kleur.cyan('--package')}      The (npm) package the error occured in   ${kleur.yellow('string')}
  ${kleur.cyan('--template')}     The issue template to use                ${kleur.yellow('string')}
  ${kleur.cyan('--print-url')}    Just print the URL to open              ${kleur.yellow('boolean')}
  ${kleur.cyan('--verbose')}      Additinal logging                       ${kleur.yellow('boolean')}
  ${kleur.cyan(`--version, ${kleur.dim('-v')}`)}  Print version                           ${kleur.yellow('boolean')}
  ${kleur.cyan(`--help, ${kleur.dim('-h')}`)}     Show this help                          ${kleur.yellow('boolean')}
`;
async function runCli(args = process.argv.slice(2)) {
  const reporter = __chunk_1.addReporter({
    log(level, ...message) {
      // eslint-disable-next-line no-console
      console[level === __chunk_1.LogLevel.Error ? 'error' : 'log'](...message);
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
    reporter.level = __chunk_1.LogLevel.Debug;
  }

  if (options.help) {
    return __chunk_1.log.info(usage);
  }

  if (options.version) {
    return __chunk_1.log.info(version);
  }

  const url = await __chunk_1.report({ ...options,
    open: !options['print-url']
  });

  if (options['print-url']) {
    __chunk_1.log.info(url);
  }

  return url;
}

if (!module.parent) {
  runCli().catch(error => {
    if (error instanceof __chunk_1.AppError) {
      if (error instanceof UsageError) {
        __chunk_1.log.info(usage);
      }

      __chunk_1.log.error(kleur.red(error.message));
      __chunk_1.log.debug(error.stack);
    } else {
      __chunk_1.log.error(error);
    }

    process.exitCode = 1;
  });
}

module.exports = runCli;
