import { Command, CommandFlags } from '../types';
import { splitArguments, parseArguments } from './parseArguments';
import { deepMerge } from '../utils';

export function filterOptions (options: { [key: string]: string | boolean }, flags: CommandFlags, argv: string[]) {
  return function (command: Command) {
    const commandArgumentKeys = filterFlags(command.flags, flags, argv);
    return filterObject(commandArgumentKeys, options);
  };
}

function filterFlags (commandFlags: CommandFlags, parsedFlags: CommandFlags, argv: string[]) {
  const mergedFlags = deepMerge(commandFlags, parsedFlags);
  const [, options] = splitArguments(parseArguments(argv, mergedFlags));

  return Object.keys(options).filter(key => {
    const value = options[key];

    if (key.startsWith('-')) return false;

    const typeOf = typeof value as 'string' | 'boolean';

    const flags = typeOf === 'string'
      ? mergedFlags.string
      : mergedFlags.boolean;

    if (typeof flags === 'string') {
      return true;
    }

    if (flags && flags.indexOf(key) > -1 ||
        flags && flags.indexOf('--' + key) > -1) {
      if (typeOf === 'string') return Boolean(value);
      return true;
    }

    return false;
  });
}

function filterObject (keys: string[], object: any): CommandFlags {
  return Object.keys(object).reduce(function (acc: any, key: string) {
    if (keys.indexOf(key) > -1) {
      acc[key] = object[key];
    }

    return acc;
  }, {});
}
