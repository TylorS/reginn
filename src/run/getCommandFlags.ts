import { Command, CommandFlags } from '../types';
import { deepMerge } from '../utils';

export function getCommandFlags (commands: Array<Command>): CommandFlags {
  return commands
    .filter(hasFlags)
    .map(command => command.flags)
    .reduce(deepMerge, {} as CommandFlags);
}

function hasFlags (command: Command): boolean {
  const flags = command.flags;

  if (flags.string && flags.string.length > 0) {
    return true;
  }

  if (flags.alias && Object.keys(flags.alias).length > 0) {
    return true;
  }

  if (flags.boolean && flags.boolean.length > 0) {
    return true;
  }

  return false;
}
