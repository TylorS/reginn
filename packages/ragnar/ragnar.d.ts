declare module "ragnar" {
  export * from "@ragnar/alias";
  export * from "@ragnar/app";
  export * from "@ragnar/callback";
  export * from "@ragnar/command";
  export * from "@ragnar/desc";
  export * from "@ragnar/flag";
  export * from "@ragnar/help";
  export * from "@ragnar/promise";
  export * from "@ragnar/run";
  export * from "@ragnar/stream";
  export * from "@ragnar/type";
}

declare module "@ragnar/alias" {
  import { ValidTypes } from "@ragnar/type";
  export type Alias = {
    type: "alias",
    flagType: ValidTypes,
    value: [string, string]
  };

  export function alias (name: string, aliasedName?: string): Alias;
}

declare module "@ragnar/app" {
  import { Command, CommandFlags } from "@ragnar/command";
  import { Flag } from "@ragnar/flag";

  export type App = {
    type: "app",
    command: Array<Command>,
    flag?: CommandFlags,
    args?: Array<string>,
    options?: Object
  }

  export function app(...definitions: Array<App | Command | Flag>): App;
}

declare module "@ragnar/command" {
  import { Alias } from "@ragnar/alias";
  import { App } from "@ragnar/app";
  import { Flag } from "@ragnar/flag";

  export type CommandFlags = {
    alias?: Array< { [name: string]: string } >,
    string?: string[],
    boolean?: string[]
  };

  export type HandlerOption = {
    args: string,
    options: Object
  };

  export type Handler = (input: HandlerOption | App) => any;

  export type Command = {
    type: "command",
    command?: Array<Command>,
    flag?: CommandFlags,
    alias?: Array<[string, string]>,
    handler?: Handler
  };

  export function command(...definitions: Array<Alias | Flag | Command>): Command;
}

declare module "@ragnar/desc" {
  export type Description = {
    type: "desc",
    value: string
  }
}

declare module "@ragnar/flag" {
  import { Alias } from "@ragnar/alias";
  import { Type, ValidTypes } from "@ragnar/type";

  export type Flag = {
    type: "flag",
    flagType: ValidTypes,
    alias: Array<[string, string]>
  };

  export function flag (...defintions: Array<Type | Alias>): Flag;
}

declare module "@ragnar/help" {
  import { App } from "@ragnar/app";
  import { Command } from "@ragnar/command";
  import { Flag } from "@ragnar/flag";

  export function help(name: string, ...definitions: Array<App | Command | Flag>): App;
}

declare module "@ragnar/run" {
  import { App } from "@ragnar/app";
  import { Command } from "@ragnar/command";

  export function run(argv: string[], app: App): { commands: Array<Command>, args: Array<string>, options: Object };
}

declare module "@ragnar/type" {
  export type ValidTypes = "string" | "boolean"

  export type Type = { type: "type", value: ValidTypes }

  export function type (value: ValidTypes): Type;
}

declare module "@ragnar/callback" {
  import { Command, Handler } from "@ragnar/command";
  export function withCallback(cmd: Command, fn: Handler): void;

}

declare module "@ragnar/promise" {
  import { Command, HandlerOption } from "@ragnar/command";

  export function asPromise(cmd: Command): Promise<HandlerOption>;
}

declare module "@ragnar/stream" {
  import { Command, HandlerOption } from "@ragnar/command";
  import { Stream } from "most";

  export function asStream(cmd: Command): Stream<HandlerOption>;
}
