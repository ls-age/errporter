import { join } from 'path';
import issueUrl from 'new-github-issue-url';
import getPackageRepo from 'get-pkg-repo';
import open from 'open';
import { readFile } from './fs';
import { AppError } from './Error';
import renderTemplate, { ResolverMap } from './template';
import log from './log';

export async function getTemplate(options: {
  template?: string;
  package?: string;
}): Promise<{ path: string; template: string }> {
  const templateName = options.template || 'bug_report.md';
  let searchPath = process.cwd();

  if (options.package) {
    searchPath = join(process.cwd(), 'node_modules', options.package);
  }

  const possibleTemplatePaths = [
    join(searchPath, '.github/ISSUE_TEMPLATE', `${templateName}`),
  ];

  if (options.template) {
    // Top priority: The template provided as option
    possibleTemplatePaths.unshift(join(process.cwd(), options.template));
  } else {
    // Fallback to old (single) github issue templates.
    possibleTemplatePaths.push(join(searchPath, '.github/ISSUE_TEMPLATE.md'));
  }

  // FIXME: Fallback to this package's issue template?

  let result: { template: string; path: string };
  for (const path of possibleTemplatePaths) {
    try {
      result = {
        template: await readFile(path, 'utf8'),
        path,
      };
      break;
    } catch (error) {
      log.debug(`Cannot read template from ${path}`);
    }
  }

  if (!result) {
    throw new AppError('No template found', { paths: possibleTemplatePaths });
  }

  return result;
}

async function getRepoInfo(options: { repo?: string; package?: string }) {
  if (options.repo) {
    return {
      repoUrl: options.repo.startsWith('http') ?
        options.repo :
        `https://github.com/${options.repo}`,
    };
  }

  const packagePath = options.package ?
    `${options.package}/package.json` :
    join(process.cwd(), './package.json');

  try {
    // eslint-disable-next-line global-require
    const repo = getPackageRepo(require(packagePath));

    return {
      repoUrl: repo.browse(),
    };
  } catch (error) {
    throw AppError.from(error, { path: packagePath });
  }
}

export interface ReportOptions {
  title?: string;
  template?: string;
  package?: string;
  repo?: string;
  resolvers?: ResolverMap;
  open?: boolean;
}

export async function report(options: ReportOptions) {
  const [{ path, template }, { repoUrl }] = await Promise.all([
    getTemplate({ template: options.template, package: options.package }),
    getRepoInfo(options),
  ]);

  log.debug(`Using issue template at '${path}'`);

  const body = await renderTemplate(template, options.resolvers);
  const url = issueUrl({
    title: options.title,
    body,
    repoUrl,
    // FIXME: Add labels, assignee, ...
  });

  if (options.open) {
    open(url);
  }

  return url;
}
