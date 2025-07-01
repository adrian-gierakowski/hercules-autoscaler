import { runMain } from '@effect/platform-node/NodeRuntime'
import { Config, DateTime, Effect, Layer, Number } from 'effect'
import { HerculesAgentManager } from './HerculesAgentManager.js'
import { HerculesClient } from './HerculesApiClient.js'
import { countQueuedTasks } from './lib.js'

const AppConfig = Config.unwrap({
  maxAge: Config.duration('MAX_AGE'),
  minAge: Config.duration('MIN_AGE'),
  maxRunnersCount: Config.integer('MAX_RUNNERS_COUNT'),
  minRunnersCount: Config.integer('MIN_RUNNERS_COUNT'),
  checkInterval: Config.duration('CHECK_INTERVAL'),
  scaleUpThreshold: Config.integer('SCALE_UP_THRESHOLD'),
  scaleUpFactor: Config.number('SCALE_UP_FACTOR'),
})

const program = Effect.gen(function*() {
  const appConfig = yield* AppConfig
  const client = yield* HerculesClient
  const agentManager = yield* HerculesAgentManager

  const { items: tasks } = yield* client.tasks.tasks({
    payload: { limit: 20 },
  })

  const score = countQueuedTasks(
    {
      ...appConfig,
      currentTime: yield* DateTime.now,
    },
    tasks,
  )

  if (score > appConfig.scaleUpThreshold) {
    const currentInstanceCount = yield* agentManager.instanceCount()
    const targetRunnerCount = Number.clamp(
      currentInstanceCount * appConfig.scaleUpFactor,
      {
        minimum: appConfig.minRunnersCount,
        maximum: appConfig.maxRunnersCount,
      },
    )
    yield* agentManager.scale(targetRunnerCount)
  } else if (score === 0) {
    yield* agentManager.scale(appConfig.minRunnersCount)
  }
})

const deps = Layer.merge(
  HerculesClient.Default,
  HerculesAgentManager.Default,
)

runMain(
  Effect.provide(program, deps),
)
