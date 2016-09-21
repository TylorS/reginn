import { colors } from '@northbrook/util'
import { shouldHandle } from '../shouldHandle'

export function withCallback (command, callback) {
  const { type } = command

  if (!shouldHandle(type)) {
    throw new Error(colors.red(`Can not handle type "${type}"`))
  }

  command.handler = callback
}
