import { red } from '../colors'
import { shouldHandle } from '../shouldHandle'

export function asPromise (command) {
  const { type } = command

  if (!shouldHandle(type)) {
    throw new Error(red(`Can not handle type "${type}"`))
  }

  let _resolve = null
  let _reject = null

  const promise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  command.handler = function (x) {
    if (_resolve) _resolve(x)
    else {
      _reject(new Error('Unable to resolve your promise'))
    }
  }

  return promise
}
