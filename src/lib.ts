import { Array, DateTime, Duration } from 'effect'
import type { Task } from './schemas.ts'

type Options = {
  currentTime: DateTime.DateTime
  minAge: Duration.Duration
  maxAge: Duration.Duration
}

export const calculateScore = (
  { currentTime, maxAge, minAge }: Options,
  tasks: ReadonlyArray<Task>,
) =>
  Array.reduce(tasks, 0, (score, task) => {
    const age = DateTime.distanceDuration(currentTime, task.creationTime)

    return Duration.greaterThan(minAge)(age) && Duration.lessThan(maxAge)(age)
      ? score + 1
      : score
  })
