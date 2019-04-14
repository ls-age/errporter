import osName from 'os-name';
import execa from 'execa';
import { replace } from 'async-replace-es6';
import { readFile } from './fs';
import { promptList, enqueuePrompt } from './prompt';
import log from './log';
import { AppError } from './Error';

const tagRegExp = /{([^}]*)}/g;
const argsRegExp = /([0-9]+)|'([^']*)'|"([^"]*)"|([^ ]+)/g;

export function parseArgs(raw) {
  const args: (string|number)[] = [];

  let m: RegExpExecArray | null;
  while ((m = argsRegExp.exec(raw)) !== null) { // eslint-disable-line no-cond-assign
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === argsRegExp.lastIndex) {
      argsRegExp.lastIndex++;
    }

    args.push(m[1] ? parseInt(m[1], 10) : m[2] || m[3] || m[4]);
  }

  return args;
}

// Built in helpers
export type Resolver = (options: { args: (number|string)[] }) => Promise<string> | string;
export type ResolverMap = { [name: string]: Resolver };

export const builtinResolvers: ResolverMap = {
  osName: () => osName(),
  async run({ args }) {
    const [bin, ...execArgs] = parseArgs(args);

    if (!bin) { return null; }

    return (await execa(bin, execArgs)).stdout;
  },
  contentsOf({ args: [fileName] }) {
    return readFile(fileName, 'utf8');
  },

  // Interactive
  insert: ({ args: [message] }) => enqueuePrompt({ message: `${message}` }),
  list: async ({ args: [message] }) => {
    const items = await promptList({ message: `${message}` });

    return items.length ? ` - ${items.join(`
 - `)}` : '';
  },
};

// eslint-disable-next-line max-len
export default async function renderTemplate(str: string, resolvers: ResolverMap = builtinResolvers) {
  return replace(str, tagRegExp, async (original, rawArgs) => {
    const [name, ...args] = parseArgs(rawArgs);
    if (!resolvers[name]) {
      log.warn('Missing resolver for name', name);
      return original;
    }

    try {
      const value = await resolvers[name]({ args });
      if (value) {
        return value;
      }

      log.info('No value provided for', name, args);
      return original;
    } catch (err) {
      log.warn(AppError.from(err, {
        message: 'Error resolving template value',
        name,
        args,
      }));
      return original;
    }
  });
}
