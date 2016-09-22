declare module "reginn" {
  export * from "@reginn/alias";
  export * from "@reginn/app";
  export * from "@reginn/callback";
  export * from "@reginn/command";
  export * from "@reginn/desc";
  export * from "@reginn/flag";
  export * from "@reginn/help";
  export * from "@reginn/promise";
  export * from "@reginn/run";
  export * from "@reginn/stream";
  export * from "@reginn/type";
}

declare module "@reginn/alias" {
  import { ValidTypes } from "@reginn/type";
  export type Alias = {
    type: "alias",
    flagType: ValidTypes,
    value: [string, string]
  };

  export function alias (name: string, aliasedName?: string): Alias;
}

declare module "@reginn/app" {
  import { Command, CommandFlags } from "@reginn/command";
  import { Flag } from "@reginn/flag";

  export type App = {
    type: "app",
    command: Array<Command>,
    flag?: CommandFlags,
    args?: Array<string>,
    options?: Object
  }

  export function app(...definitions: Array<App | Command | Flag>): App;
}

declare module "@reginn/command" {
  import { Alias } from "@reginn/alias";
  import { App } from "@reginn/app";
  import { Flag } from "@reginn/flag";

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

declare module "@reginn/desc" {
  export type Description = {
    type: "desc",
    value: string
  }
}

declare module "@reginn/flag" {
  import { Alias } from "@reginn/alias";
  import { Type, ValidTypes } from "@reginn/type";

  export type Flag = {
    type: "flag",
    flagType: ValidTypes,
    alias: Array<[string, string]>
  };

  export function flag (...defintions: Array<Type | Alias>): Flag;
}

declare module "@reginn/help" {
  import { App } from "@reginn/app";
  import { Command } from "@reginn/command";
  import { Flag } from "@reginn/flag";

  export function help(name: string, ...definitions: Array<App | Command | Flag>): App;
}

declare module "@reginn/run" {
  import { App } from "@reginn/app";
  import { Command } from "@reginn/command";

  export function run(argv: string[], app: App): { commands: Array<Command>, args: Array<string>, options: Object };
}

declare module "@reginn/type" {
  export type ValidTypes = "string" | "boolean"

  export type Type = { type: "type", value: ValidTypes }

  export function type (value: ValidTypes): Type;
}

declare module "@reginn/callback" {
  import { Command, Handler } from "@reginn/command";
  export function withCallback(cmd: Command, fn: Handler): void;

}

declare module "@reginn/promise" {
  import { Command, HandlerOption } from "@reginn/command";

  export function asPromise(cmd: Command): Promise<HandlerOption>;
}

declare module "@reginn/stream" {
  import { Command, HandlerOption } from "@reginn/command";
  import { Stream } from "most";

  export function asStream(cmd: Command): Stream<HandlerOption>;
}
