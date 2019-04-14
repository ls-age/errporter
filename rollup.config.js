import { builtinModules } from 'module';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import { dependencies } from './package.json';

const extensions = ['.js', '.ts'];

export default {
  input: [
    './src/index.ts',
    './src/cli.ts',
  ],
  external: builtinModules.concat(Object.keys(dependencies)),
  plugins: [
    resolve({ extensions }),
    babel({
      extensions,
      include: './src/**/*',
    }),
    json(),
  ],
  output: [
    {
      format: 'cjs',
      dir: 'out/cjs',
    },
    {
      format: 'es',
      dir: 'out/es',
    },
  ],
};
