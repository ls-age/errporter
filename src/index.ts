import { ReportOptions, report } from './lib/report';
import log from './lib/log';

export async function reportError(error: Error, options: ReportOptions) {
  const url = await report({
    title: error.message,
    ...options,
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
