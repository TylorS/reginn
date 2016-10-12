import { red } from '../colors'
import { shouldHandle } from '../shouldHandle'

export function asPromise (command) {
  const { type } = command

  if (!shouldHandle(type)) {
    throw new Error(red(`Can not handle type "${type}"`))
  }

  let _resolve = null

  const promise = new Promise((resolve) => {
    _resolve = resolve
  })

  command.handler = function (x) {
    if (_resolve) _resolve(x)
    else {
      throw new Error('Unable to resolve your promise')
    }
  }

  return promise
}
