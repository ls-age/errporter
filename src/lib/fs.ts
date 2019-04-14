import { promisify } from 'util';
import { readFile as _readFile } from 'fs';

export const readFile = promisify(_readFile);
