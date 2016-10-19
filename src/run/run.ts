import { App, Command, HandlerApp, Handler } from '../types';
import { forEach, ifElse } from 'ramda';
import { parseArguments, splitArguments } from './parseArguments';
import { matchCommands } from './matchCommands';
import { getCommandFlags } from './getCommandFlags';
import { filterOptions } from './filterOptions';
import { callCommand } from './callCommand';
import { red, white, yellow, bold, cross, deepMerge } from '../utils';

export interface RunFn extends Handler {
  (args: Array<string>, app: App | Command | HandlerApp):  Promise<HandlerApp>;
  (app: App | Command | HandlerApp): Promise<HandlerApp>;
}

export const run: RunFn = function run (argv: Array<string>, command: App | Command | HandlerApp): Promise<HandlerApp> {
  // support running `run()` without argv
  if (!Array.isArray(argv) && (argv as HandlerApp).type === 'app') {
    // subcommand support
    if ((argv as HandlerApp).args) {
      return run((argv as HandlerApp).args, argv);
    }

    // use process.argv
    return run(process && process.argv.slice(2) || [], argv);
  };

  const matchedCommands = matchCommands(command, parseArguments(argv, command.flags));

  if (matchedCommands.length === 0) {
    const args = parseArguments(argv, command.flags);
    throw new Error(red(bold(cross)) + ' ' +
      white('Can not find command ') +
      (args._[0] ? red(bold(`${args._[0]}`)) : ''));
  }

  const commandFlags = deepMerge(command.flags, getCommandFlags(matchedCommands));
  const [args, options] = splitArguments(parseArguments(argv, commandFlags));

  const filterCommandOptions = filterOptions(options, command.flags, argv);
  const commandCall = callCommand(argv, args, commandFlags, filterCommandOptions);

  forEach(ifElse(hasHandlerFn, commandCall, logWarning), matchedCommands);

  return Promise.resolve<HandlerApp>({
    type: 'app',
    flags: commandFlags,
    commands: matchedCommands,
    args,
    options
  });
} as RunFn;

function hasHandlerFn (command: Command) {
  return isFunction(command.handler);
}

function isFunction (x: any): boolean {
  return !!(x && x.constructor && x.call && x.apply);
}

function logWarning (command: Command) {
  const aliases = command.aliases;
  if (aliases.length > 0) {
    const name = aliases[0].name;
    console.log(yellow(`${name}`) + white(` does not have an associated handler!`));
  }
}
