import { Command, CommandFlags, HandlerApp } from '../types';
import { tail } from 'ramda';
import { getCommandFlags } from './getCommandFlags';
import { filterOptions } from './filterOptions';
import { deepMerge } from '../utils';

export function callCommand (argv: string[], parsedArgs: string[],
                             flags: CommandFlags, filter: (command: Command) => CommandFlags) {
  return function (command: Command) {
    if (!command.handler) { return; }

    if (command.commands.length > 0) {
      const commandFlags = deepMerge(flags, getCommandFlags(command.commands));
      command.handler(createSubApplication(argv, parsedArgs, commandFlags, command));
    } else if (command.aliases && command.aliases.length > 0) {
      command.handler({ args: tail(parsedArgs), options: optionsToCamelCase(filter(command)) });
    } else {
      command.handler({ args: parsedArgs, options: optionsToCamelCase(filter(command)) });
    }
  };
}

function optionsToCamelCase (options: any) {
  return Object.keys(options).reduce((acc: any, key: string) => {
    const value = options[key];

    acc[toCamelCase(key)] = value;

    return acc;
  }, {});
}

function toCamelCase (str: string): string {
  return str.replace(/-\w/, (x) => x[1].toUpperCase());
}

function createSubApplication (argv: string[], parsedArgs: string[],
                               commandFlags: CommandFlags, command: Command): HandlerApp {
  const flags = argv.filter(arg => parsedArgs.indexOf(arg) === -1);
  const args = tail(parsedArgs).concat(flags);
  const filter = filterOptions(commandFlags as any, command.flags, args);

  return {
    type: 'app',
    args,
    options: optionsToCamelCase(filter(command)),
    commands: command.commands,
    flags: commandFlags,
  };
}
