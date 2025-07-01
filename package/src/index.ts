import { runMain } from '@effect/platform-node/NodeRuntime'
import { Config, Effect, pipe, Schedule } from 'effect'
import { AutoScaler } from './AutoScaler.js'

const AppConfig = Config.unwrap({
  maxAge: Config.duration('MAX_AGE'),
  minAge: Config.duration('MIN_AGE'),
  maxRunnersCount: Config.integer('MAX_RUNNERS_COUNT'),
  minRunnersCount: Config.integer('MIN_RUNNERS_COUNT'),
  checkInterval: Config.duration('CHECK_INTERVAL'),
  scaleUpThreshold: Config.integer('SCALE_UP_THRESHOLD'),
  scaleUpFactor: Config.number('SCALE_UP_FACTOR'),
})

export const program = Effect.gen(function*() {
  const appConfig = yield* AppConfig
  const autoScaler = yield* AutoScaler

  const schedule = Schedule.spaced(appConfig.checkInterval)

  const run = pipe(
    autoScaler.run(appConfig),
    Effect.sandbox,
    Effect.tapError(error => Effect.log('Error during AutoScaler run:', error)),
    Effect.either,
  )

  yield* Effect.repeat(
    run,
    schedule,
  )
})

const deps = AutoScaler.Default

runMain(
  Effect.provide(program, deps),
)
