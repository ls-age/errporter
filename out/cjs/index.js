'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

async function reportError(error, options) {
  const url = await __chunk_1.report({
    title: error.message,
    ...options
  });

  if (!options.open) {
    __chunk_1.log.info('Open this URL to report the error:');
    __chunk_1.log.error(url);
  }
}
/* export function reporter(options: ReportOptions) {
  return (error: Error) => reportError(error, options)
    .catch((reporterError) => {
      throw new AppError('Error reporting failed', {
        reporterError,
        appError: error,
      });
    });
} */

exports.reportError = reportError;
