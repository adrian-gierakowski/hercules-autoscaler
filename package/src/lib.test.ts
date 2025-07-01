import { DateTime, Duration } from 'effect'
import assert from 'node:assert'
import { it } from 'vitest'
import { calculateScore } from './lib.ts'
import { Task } from './schemas.ts'

it('calculateScore', () => {
  const currentTime = DateTime.unsafeMake({ year: 2000 })
  const minAge = Duration.minutes(5)
  const maxAge = Duration.days(1)
  const options = {
    currentTime,
    minAge,
    maxAge,
  }

  assert.equal(
    calculateScore(options, [Task.make({ creationTime: currentTime })]),
    0,
  )

  assert.equal(
    calculateScore(options, [
      Task.make({ creationTime: DateTime.add(currentTime, { minutes: 10 }) }),
    ]),
    1,
  )

  assert.equal(
    calculateScore(options, [
      Task.make({
        creationTime: DateTime.add(currentTime, { days: 1, seconds: 1 }),
      }),
    ]),
    0,
  )
})
