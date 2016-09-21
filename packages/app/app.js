import { reduce, append, merge } from '@northbrook/util'

export const app = (...definitions) =>
  reduce(toType, { type: 'app', command: [] }, definitions)

function toType (acc, definition) {
  const { type, flagType, ...rest } = definition
  switch (type) {
    case 'flag': {
      return addFlag(acc, flagType, rest.alias)
    }
    case 'command': {
      acc.command = append(rest, acc.command)
      return acc
    }
    case 'app': {
      const { flag, command } = definition
      acc.flag = merge(acc.flag || {}, flag || {})

      return reduce(toType, acc, command)
    }
    default: return acc
  }
}

function addFlag (command, flagType, value) {
  return reduce((acc, [name, alias]) => {
    const obj = merge(acc.flag || {}, {
      alias: { [ name ]: alias },
      [ flagType ]: [ name ]
    })

    acc.flag = obj

    return acc
  }, command, value)
}
