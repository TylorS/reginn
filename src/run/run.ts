import { App, Command, HandlerApp, Handler, Alias, CommandFlags } from '../types';
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

export const run: RunFn = function run (
  argv: Array<string>,
  command: App | Command | HandlerApp): Promise<HandlerApp>
{
  // support running `run()` without argv
  if (!Array.isArray(argv) && (argv as HandlerApp).type === 'app') {
    // subcommand support
    if ((argv as HandlerApp).args) {
      return run((argv as HandlerApp).args, argv);
    }

    // use process.argv
    return run(process && process.argv.slice(2) || [], argv);
  };

  const parsedArguments = parseArguments(argv, command.flags);

  const matchedCommands = matchCommands(command, parsedArguments);

  if (matchedCommands.length === 0 && !(parsedArguments as any).help) {
    throw new Error(red(bold(cross)) + ' ' +
      white('Can not find command ') +
      (parsedArguments._[0] ? red(bold(`${parsedArguments._[0]}`)) : ''));
  }

  const commandFlags = deepMerge(command.flags, getCommandFlags(matchedCommands));
  const [args, options] = splitArguments(parseArguments(argv, commandFlags));

  const filterCommandOptions = filterOptions(options, command.flags, argv);
  const commandCall = callCommand(argv, args, commandFlags, filterCommandOptions);

  if ((parsedArguments as any).help === true) {
    if (command.type === 'app') {
      console.log(`\n${command.commands.map(display)}`.replace('\n,', '\n'));
    }

    if (command.type === 'command') {
      console.log(`\n${[command].map(display)}`);
    }

    return Promise.resolve<HandlerApp>({
      type: 'app',
      flags: commandFlags,
      commands: matchedCommands,
      args,
      options,
    });
  }

  forEach(ifElse(hasHandlerFn, commandCall, logWarning), matchedCommands);

  return Promise.resolve<HandlerApp>({
    type: 'app',
    flags: commandFlags,
    commands: matchedCommands,
    args,
    options,
  });
} as RunFn;

function display (command: Command) {
  return `\n${command.aliases.map(displayAlias)}` +
  `${command.description ? '  -  ' + command.description : ''}
  ${displayFlags(command.flags)}\n`;
}

function displayAlias (alias: Alias) {
  return alias.name === alias.abbreviation
    ? `${alias.name}`
    : `${alias.name} -${alias.abbreviation}\n`;
}

function displayFlags (flags: CommandFlags) {
  const aliases = flags.alias || {};

  const _strings = flags.string && Array.isArray(flags.string)
    ? flags.string
    : [flags.string as any as string];

  const strings = _strings.filter(Boolean)
    .map(x => `--${x}${aliases && aliases[x] ? ', -' + aliases[x] : ''}` +
      // tslint:disable-next-line
      `${(flags as any).description && (flags as any).description[x] ? '  :  ' + (flags as any).description[x] : ''}`);

  const booleans = flags.boolean
    && flags.boolean.map(x => `--${x}${aliases && aliases[x] ? ', -' + aliases[x] : ''}` +
      // tslint:disable-next-line
      `${(flags as any).description && (flags as any).description[x] ? '  :  ' + (flags as any).description[x] : ''}`)
    || [``];

  return strings.join(`\n`) + booleans.join('\n');
}

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
