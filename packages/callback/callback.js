import { red } from '../colors'
import { shouldHandle } from '../shouldHandle'

export function withCallback (command, callback) {
  const { type } = command

  if (!shouldHandle(type)) {
    throw new Error(red(`Can not handle type "${type}"`))
  }

  if (!callback) {
    return function (cb) {
      command.handler = cb
    }
  }

  command.handler = callback
}
