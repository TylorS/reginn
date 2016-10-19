import { App, Command, Flag, HandlerOptions, HandlerApp } from '../types';
import { flatten } from 'ramda';
import { app, command, alias } from '../definitions';
import { run } from '../run';
import { withCallback } from '../handlers';

export function help(name: string, ...definitions: Array<App | Command | Flag>): App {
  return app(...definitions, buildHelpCommand(name, definitions));
};

function buildHelpCommand (name: string, definitions: Array<App | Command | Flag>): Command {
  const helpCommand = command(alias('help'));

  withCallback(helpCommand, function (app: HandlerOptions | HandlerApp) {
    if (app.args.length > 0) {
      const name = app.args.shift() as string;
      run(['help', ...app.args], help(name, app as App));
    } else {
      displayHelp(name, definitions);
    }
  });

  return helpCommand;
}

function filterType (type: string) {
  return function <T> (definitions: Array<App | Command | Flag>): Array<T> {
    return definitions.filter(def => def.type === type &&
      !!(def as any).description &&
      (def as any).alias.name
    ) as any as Array<T>;
  };
}

const filterApp = filterType('app');
const filterCommands = filterType('command');
const filterFlag = filterType('flag');

function displayHelp (name: string, definitions: Array<App | Command | Flag>) {
  const apps = filterApp<App>(definitions);
  const cmds = flatten(apps.map(x => x.commands)).concat(filterCommands<Command>(definitions));
  const flags = filterFlag<Flag>(definitions);

  console.log(`  ${name.toUpperCase()}

  COMMANDS:
    ${cmds.map(displayCommand)}

  FLAGS:

    ${flags.map(displayFlag)}
`);
}

function displayCommand ({ aliases, description }: Command) {
  return `${aliases[0].name} ${description ? '- ' + description : ''}\n    `;
}

function displayFlag ({ aliases, description }: Flag) {
  return `${aliases[0].name} ${description ? '- ' + description : ''}\n    `;
}