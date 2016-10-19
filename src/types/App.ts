import { Command, CommandFlags } from './Command';

export interface App {
  type: 'app';
  commands: Array<Command>;
  flags: CommandFlags;
}