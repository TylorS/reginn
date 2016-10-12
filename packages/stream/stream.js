import scheduler from 'most/lib/scheduler/defaultScheduler'
import { multicast, never } from 'most'
import { red } from '../colors'

import { shouldHandle } from '../shouldHandle'

function subject () {
  const stream = multicast(never())

  const observer = {
    next: x => stream.source.event(scheduler.now(), x),
    error: e => stream.source.error(scheduler.now(), e),
    complete: x => stream.source.end(scheduler.now(), x)
  }

  return { observer, stream }
}

export function asStream (command) {
  const { type } = command

  if (!shouldHandle(type)) {
    throw new Error(red(`Can not handle type "${type}"`))
  }

  const { observer, stream } = subject()

  command.handler = function (x) {
    observer.next(x)
    process.nextTick(() => {
      observer.complete(x)
    })
  }

  command.handler.error = function (e) {
    observer.error(e)
  }

  return stream
}
