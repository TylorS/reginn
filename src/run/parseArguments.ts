import { CommandFlags } from '../types';
import * as minimist from 'minimist';

export function parseArguments (argv: string[], flags: CommandFlags) {
  const args = argv === process.argv
    ? process.argv.slice(2)
    : argv;

  return minimist(args, flags);
}

export function splitArguments (parsedArgs: minimist.ParsedArgs):
    [string[], { [flagName: string]: string | boolean }] {
  const args = parsedArgs._;

  const options: { [flagName: string]: string | boolean } =
    Object.keys(parsedArgs)
      .filter(x => x !== '_')
      .reduce((acc: any, key: string) => {
        acc[key] = parsedArgs[key];
        return acc;
      }, {});

  return [args, options];
}