import 'path';
import 'new-github-issue-url';
import 'get-pkg-repo';
import 'open';
import 'util';
import 'fs';
import { a as report, b as log } from './chunk-43199bc8.js';
import 'os-name';
import 'execa';
import 'async-replace-es6';
import 'prompts';

async function reportError(error, options) {
  const url = await report({
    title: error.message,
    ...options
  });

  if (!options.open) {
    log.info('Open this URL to report the error:');
    log.error(url);
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

export { reportError };
