import { Alias } from './Alias';
import { App } from './App';

// mirrors Minimist options Type with restriction
export interface CommandFlags {
  // a string or array of strings argument names to always treat as strings
  string?: string[];
  // a string or array of strings to always treat as booleans
  boolean?: string[];
  // an object mapping string names to strings or arrays of string argument names to use
  alias?: { [key: string]: string };
  // an object mapping string argument names to default values
  default?: { [key: string]: any };
}

export interface HandlerOptions {
  args: Array<string>;
  options: any;
}

export interface HandlerApp extends App {
  args: Array<string>;
  options: any;
}

export interface Handler {
  (input: HandlerOptions | HandlerApp): any;
}

export interface Command {
  type: 'command';
  flags: CommandFlags;
  aliases: Array<Alias>;
  commands: Array<Command>;
  description?: string;
  handler?: Handler;
}