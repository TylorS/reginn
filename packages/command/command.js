import { reduce, merge } from '@northbrook/util'

export const command = (...definitions) =>
  reduce(toType, { type: TYPE }, definitions)

function toType (acc, definition) {
  const { type, flagType, alias, value } = definition
  switch (type) {
    case 'flag': {
      return addFlag(acc, flagType, alias)
    }
    case 'alias': {
      acc.alias = (acc.alias || []).concat([ value ])
      return acc
    }
    case 'command': {
      acc.command = (acc.command || []).concat([ definition ])
      return acc
    }
    case 'desc': {
      acc.desc = value
      return acc
    }
    default: return acc
  }
}

function addFlag (command, flagType, value) {
  return reduce((acc, [name, alias]) => {
    const obj = name === alias
      ? { [ flagType ]: [ name ] }
      : {
        alias: {
          [ name ]: alias
        },
        [ flagType ]: [ name ]
      }

    acc.flag = merge(acc.flag || {}, obj)

    return acc
  }, command, value)
}

const TYPE = 'command'
