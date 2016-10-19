import { App, Command, Flag, CommandFlags} from '../types';
import { reduce } from 'ramda';
import { deepMerge, addFlag } from '../utils';

export function app(...definitions: Array<Command | Flag | App>): App {
  const { commands, flags } = reduce(toType, {flags: {}, commands: []}, definitions);
  return new ReginnApp(commands, flags);
}

function toType (acc: { flags: CommandFlags, commands: Array<Command> }, definition: Command | Flag | App):
    { flags: CommandFlags, commands: Array<Command> } {
  if (definition.type === 'flag') {
    return addFlag(acc, definition);
  }

  if (definition.type === 'command') {
    acc.commands = acc.commands.concat([ definition ]);
  }

  if (definition.type === 'app') {
    deepMerge(acc.flags, definition.flags);
    acc.commands = acc.commands.concat(definition.commands);
  }

  return acc;
}

class ReginnApp implements App {
  public type: 'app' = 'app';
  public commands: Array<Command>;
  public flags: CommandFlags;

  constructor (commands: Array<Command> , flags: CommandFlags) {
    this.commands = commands;
    this.flags = flags;
  }
}