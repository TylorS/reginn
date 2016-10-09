import { map, filter, concat } from 'ramda'
import { app } from '@reginn/app'
import { command } from '@reginn/command'
import { alias } from '@reginn/alias'
import { run } from '@reginn/run'
import { asStream } from '@reginn/stream'

export function help (name, ...definitions) {
  if (typeof name !== 'string') {
    throw new Error('help must be given a name as its first argument')
  }

  return app(...definitions, buildHelpCommand(name, definitions))
}

function buildHelpCommand (name, definitions) {
  const helpCommand = command(alias('help'))

  const displayHelp = showHelp(name, definitions)

  asStream(helpCommand).observe((app) => {
    if (app.args.length > 0) {
      const name = app.args.shift()
      run(['help', ...app.args], help(name, app))
    } else {
      displayHelp(app, '')
    }
  })

  return helpCommand
}

function showHelp (name, definitions) {
  const apps = filterApp(definitions)
  const cmds = concat(filterCommands(definitions), map(x => x.command, apps))
  const flags = concat(filterFlag(definitions), map(x => x.flag, apps))

  return function ({ args, options }, description) {
    console.log(`  ${name.toUpperCase()}

  COMMANDS:

    ${cmds.map(displayCommand)}

  FLAGS:

    ${flags.map(displayFlag)}
`)
  }
}

function displayCommand ({ alias, desc }) {
  return `${alias[0][0]} ${desc ? '- ' + desc : ''}\n    `
}

function displayFlag ({ alias, desc }) {
  return `${alias[0][0]} ${desc ? '- ' + desc : ''}\n    `
}

const filterType = type => definitions =>
  filter(x => x.type === type && !!x.desc && x.alias && x.alias[0][0], definitions)

const filterApp = filterType('app')
const filterCommands = filterType('command')
const filterFlag = filterType('flag')
