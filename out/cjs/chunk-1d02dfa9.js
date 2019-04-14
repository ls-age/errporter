'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var issueUrl = _interopDefault(require('new-github-issue-url'));
var getPackageRepo = _interopDefault(require('get-pkg-repo'));
var open = _interopDefault(require('open'));
var util = require('util');
var fs = require('fs');
var osName = _interopDefault(require('os-name'));
var execa = _interopDefault(require('execa'));
var asyncReplaceEs6 = require('async-replace-es6');
var prompts = require('prompts');

const readFile = util.promisify(fs.readFile);

class AppError extends Error {
  static from(error, info) {
    const err = new this(error.message, info);
    err.stack = error.stack;
    return err;
  }

  constructor(message, info) {
    super(message);
    this.info = info;
  }

}

function promptSingleValue({
  message,
  type = 'text'
}) {
  return prompts.prompt({
    message,
    type,
    name: 'value'
  }).then(({
    value
  }) => value);
}

let lastInteractiveAction;
function enqueueInteractiveAction(action) {
  const previous = lastInteractiveAction;
  lastInteractiveAction = new Promise(async (resolve, reject) => {
    await previous;
    return action().then(resolve, reject);
  });
  return lastInteractiveAction;
}
function enqueuePrompt({
  message,
  type = 'text'
}) {
  return enqueueInteractiveAction(() => promptSingleValue({
    type,
    message
  }));
}
function promptList({
  message
}) {
  return enqueueInteractiveAction(() => {
    const getNext = async (current = []) => {
      const value = await promptSingleValue({
        message: current.length ? ' - ' : `${message}
  (Type an empty line to end)
   - `
      });
      return value ? getNext(current.concat(value)) : current;
    };

    return getNext();
  });
}

(function (LogLevel) {
  LogLevel[LogLevel["Silent"] = 0] = "Silent";
  LogLevel[LogLevel["Error"] = 1] = "Error";
  LogLevel[LogLevel["Warn"] = 2] = "Warn";
  LogLevel[LogLevel["Info"] = 3] = "Info";
  LogLevel[LogLevel["Debug"] = 4] = "Debug";
})(exports.LogLevel || (exports.LogLevel = {}));

class Reporter {
  constructor(options) {
    this.level = options.level || exports.LogLevel.Info;
    this.log = options.log;
  }

}

const reporters = [];

const log = (level, ...message) => {
  reporters.forEach(reporter => {
    if (reporter.level >= level) {
      reporter.log(level, ...message);
    }
  });
};

function addReporter(options) {
  const reporter = new Reporter(options);
  reporters.push(reporter);
  return reporter;
}
var log$1 = {
  error: log.bind(null, exports.LogLevel.Error),
  warn: log.bind(null, exports.LogLevel.Warn),
  info: log.bind(null, exports.LogLevel.Info),
  debug: log.bind(null, exports.LogLevel.Debug)
};

const tagRegExp = /{([^}]*)}/g;
const argsRegExp = /([0-9]+)|'([^']*)'|"([^"]*)"|([^ ]+)/g;
function parseArgs(raw) {
  const args = [];
  let m;

  while ((m = argsRegExp.exec(raw)) !== null) {
    // eslint-disable-line no-cond-assign
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === argsRegExp.lastIndex) {
      argsRegExp.lastIndex++;
    }

    args.push(m[1] ? parseInt(m[1], 10) : m[2] || m[3] || m[4]);
  }

  return args;
} // Built in helpers

const builtinResolvers = {
  osName: () => osName(),

  async run({
    args
  }) {
    const [bin, ...execArgs] = parseArgs(args);

    if (!bin) {
      return null;
    }

    return (await execa(bin, execArgs)).stdout;
  },

  contentsOf({
    args: [fileName]
  }) {
    return readFile(fileName, 'utf8');
  },

  // Interactive
  insert: ({
    args: [message]
  }) => enqueuePrompt({
    message: `${message}`
  }),
  list: async ({
    args: [message]
  }) => {
    const items = await promptList({
      message: `${message}`
    });
    return items.length ? ` - ${items.join(`
 - `)}` : '';
  }
}; // eslint-disable-next-line max-len

async function renderTemplate(str, resolvers = builtinResolvers) {
  return asyncReplaceEs6.replace(str, tagRegExp, async (original, rawArgs) => {
    const [name, ...args] = parseArgs(rawArgs);

    if (!resolvers[name]) {
      log$1.warn('Missing resolver for name', name);
      return original;
    }

    try {
      const value = await resolvers[name]({
        args
      });

      if (value) {
        return value;
      }

      log$1.info('No value provided for', name, args);
      return original;
    } catch (err) {
      log$1.warn(AppError.from(err, {
        message: 'Error resolving template value',
        name,
        args
      }));
      return original;
    }
  });
}

async function getTemplate(options) {
  const templateName = options.template || 'bug_report.md';
  let searchPath = process.cwd();

  if (options.package) {
    searchPath = path.join(process.cwd(), 'node_modules', options.package);
  }

  const possibleTemplatePaths = [path.join(searchPath, '.github/ISSUE_TEMPLATE', `${templateName}`)];

  if (options.template) {
    // Top priority: The template provided as option
    possibleTemplatePaths.unshift(path.join(process.cwd(), options.template));
  } else {
    // Fallback to old (single) github issue templates.
    possibleTemplatePaths.push(path.join(searchPath, '.github/ISSUE_TEMPLATE.md'));
  } // FIXME: Fallback to this package's issue template?


  let result;

  for (const path of possibleTemplatePaths) {
    try {
      result = {
        template: await readFile(path, 'utf8'),
        path
      };
      break;
    } catch (error) {
      log$1.debug(`Cannot read template from ${path}`);
    }
  }

  if (!result) {
    throw new AppError('No template found', {
      paths: possibleTemplatePaths
    });
  }

  return result;
}

async function getRepoInfo(options) {
  if (options.repo) {
    return {
      repoUrl: options.repo.startsWith('http') ? options.repo : `https://github.com/${options.repo}`
    };
  }

  const packagePath = options.package ? `${options.package}/package.json` : path.join(process.cwd(), './package.json');

  try {
    // eslint-disable-next-line global-require
    const repo = getPackageRepo(require(packagePath));
    return {
      repoUrl: repo.browse()
    };
  } catch (error) {
    throw AppError.from(error, {
      path: packagePath
    });
  }
}

async function report(options) {
  const [{
    path,
    template
  }, {
    repoUrl
  }] = await Promise.all([getTemplate({
    template: options.template,
    package: options.package
  }), getRepoInfo(options)]);
  log$1.debug(`Using issue template at '${path}'`);
  const body = await renderTemplate(template, options.resolvers);
  const url = issueUrl({
    title: options.title,
    body,
    repoUrl // FIXME: Add labels, assignee, ...

  });

  if (options.open) {
    open(url);
  }

  return url;
}

exports.AppError = AppError;
exports.addReporter = addReporter;
exports.log = log$1;
exports.report = report;
