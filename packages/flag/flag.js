import { reduce } from 'ramda'

export const flag = (...definitions) =>
  reduce(toType, {type: TYPE, flagType: 'string', alias: []}, definitions)

function toType (acc, { type, value }) {
  switch (type) {
    case 'type': {
      acc.flagType = value
      return acc
    }
    case 'alias': {
      acc.alias = acc.alias.concat([ value ])
      return acc
    }
    case 'desc': {
      acc.desc = value
      return acc
    }
    default: return acc
  }
}

const TYPE = 'flag'
