import { map, filter, pluck, is, tail, pipe, each, reduce, merge,
         id, ifElse, contains, partial, __, set, colors, figures } from '@northbrook/util'

import minimist from 'minimist'

export function run (argv, app) {
  if (!app) {
    // support run as a handler for subcommands
    if (argv.type && argv.type === 'command' || argv.type === 'app') {
      app = argv
      argv = app.args || process.argv.slice(2)
    } else {
      throw new Error('Run must be given an App or Command to run')
    }
  }

  const args = getArgs(argv, app)

  const matchedCommands = matchCommands(app, args)

  /* fail early if no commands are matched */
  if (matchedCommands.length === 0) {
    return console.error(colors.red.bold(figures.cross) + ' ' +
      colors.white('Can not find command ') +
      (args._[0] ? colors.red.bold(`${args._[0]}`) : ''))
  }

  const commandOptions = Object.assign({}, app.flag || {}, getCommandArgs(matchedCommands))
  const { _, ...options } = getArgs(argv, { flag: commandOptions })

  const hasHandlerFn = pipe(pluck('handler'), is('function'))
  const filterCommandOptions = filterOptions(options, app.flag || {}, argv)
  const commandCall = callCommand(filterCommandOptions, _, commandOptions, argv)

  each(ifElse(hasHandlerFn, commandCall, logWarning), matchedCommands)

  return { type: 'app', flag: commandOptions, command: matchedCommands, args: _, commandOptions }
}

function getArgs (argv, app) {
  return minimist(argv === process.argv ? process.argv.slice(2) : argv, app.flag)
}

function matchCommands (app, args) {
  const isCmd = ([name, alias]) => is(args._[0], name) || is(args._[0], alias)
  const aliasMatches = cmd => filter(isCmd, cmd.alias).length > 0

  const filterMatches = ifElse(hasAlias, aliasMatches, id)

  return filter(filterMatches, app.type === 'command' ? [app] : app.command)
}

const hasAlias = x => !!x.alias
const hasFlag = x => !!x.flag
const getCommandArgs = pipe(filter(hasFlag), map(pluck('flag')))

function filterOptions (options, globals, argv) {
  return function (command) {
    const commandArgs = filterFlags(command.flag || {}, globals, argv)
    return filterObject(commandArgs, options)
  }
}

function filterFlags (command, globals, argv) {
  const flags = merge(globals, command)
  const {_, ..._options} = getArgs(argv, { flag: flags }) // eslint-disable-line no-unused-vars

  return Object.keys(_options).filter(key => {
    const value = _options[key]

    const typeOf = Array.isArray(value) ? 'array' : typeof value

    if (typeOf && flags[typeOf] && contains(key, flags[typeOf])) {
      if (typeOf === 'string') {
        return Boolean(value)
      }
      return true
    }

    return false
  })
}

const filterObject = function (_keys, obj) {
  const containsKey = partial(contains, [__, _keys])
  const setKey = (key, o) => obj[key] ? set(obj[key], key, o) : o

  return reduce((acc, key) => {
    if (containsKey(key)) return setKey(key, acc)
    return acc
  }, {}, _keys)
}

function callCommand (filter, args, options, argv) {
  return function (cmd) {
    if (cmd.command && cmd.command.length > 0) {
      const commandOptions = Object.assign({}, options,
          reduce(merge, {}, getCommandArgs(cmd.command)))

      cmd.handler(createSubApp(args, filter, commandOptions, cmd, argv))
    } else if (cmd.alias && cmd.alias.length > 0) {
      cmd.handler({ args: tail(args), options: optionsToCamelCase(filter(cmd)) })
    } else {
      cmd.handler({ args, options: optionsToCamelCase(filter(cmd)) })
    }
  }
}

function createSubApp (args, filter, options, cmd, argv) {
  const flags = argv.filter(arg => !contains(arg, args))
  return {
    args: tail(args).concat(flags),
    options: optionsToCamelCase(filter(cmd)),
    type: 'app',
    command: cmd.command,
    flag: options
  }
}

function optionsToCamelCase (options) {
  return reduce((acc, key) => {
    const value = options[key]

    acc[toCamelCase(key)] = value

    return acc
  }, {}, Object.keys(options))
}

function toCamelCase (str) {
  return str.replace(/-\w/, (x) => x[1].toUpperCase())
}

function logWarning (cmd) {
  const name = cmd.alias && cmd.alias[0] && cmd.alias[0][0] || ''
  console.log(colors.yellow(`${name}`) + colors.white(` does not have an associated handler!`))
}
