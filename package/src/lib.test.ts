import { DateTime, Duration } from 'effect'
import { expect, it } from 'vitest'
import { countQueuedTasks } from './lib.js'
import { Task } from './schemas.js'

it('countQueuedTasks', () => {
  const currentTime = DateTime.unsafeMake({ year: 2000 })
  const minAge = Duration.minutes(5)
  const maxAge = Duration.days(1)
  const options = {
    currentTime,
    minAge,
    maxAge,
  }

  expect(
    countQueuedTasks(options, [Task.make({ creationTime: currentTime })]),
  )
    .toBe(0)

  expect(
    countQueuedTasks(options, [
      Task.make({ creationTime: DateTime.add(currentTime, { minutes: 10 }) }),
    ]),
  )
    .toBe(1)

  expect(
    countQueuedTasks(options, [
      Task.make({
        creationTime: DateTime.add(currentTime, { days: 1, seconds: 1 }),
      }),
    ]),
  )
    .toBe(0)
})
