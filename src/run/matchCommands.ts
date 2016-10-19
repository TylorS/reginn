import { Command, App, Alias } from '../types';
import * as minimist from 'minimist';
import { ifElse, identity } from 'ramda';

export function matchCommands (app: Command | App, args: minimist.ParsedArgs): Array<Command> {
  const filterMatches = ifElse(hasAliases, aliasMatches(args._[0]), identity);

  if (app.type === 'app') {
    return app.commands.filter(filterMatches);
  }

  return [app].filter(filterMatches);
}

function hasAliases (command: Command) {
  return command.aliases.length > 0;
}

function aliasMatches (commandName: string) {
  return function (command: Command): boolean {
    return command.aliases.filter(matchAlias(commandName)).length > 0;
  };
}

function matchAlias (name: string) {
  return function (alias: Alias) {
    return alias.name === name || alias.abbreviation === name;
  };
}