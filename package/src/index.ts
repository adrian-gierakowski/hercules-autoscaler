import { runMain } from '@effect/platform-node/NodeRuntime'
import { Config, DateTime, Effect, Layer } from 'effect'
import { HerculesAgentManager } from './HerculesAgentManager.ts'
import { HerculesClient } from './HerculesApiClient.ts'
import { calculateScore } from './lib.ts'

const AppConfig = Config.unwrap({
  maxAge: Config.duration('MAX_AGE'),
  minAge: Config.duration('MIN_AGE'),
})

const program = Effect.gen(function*() {
  const appConfig = yield* AppConfig
  const client = yield* HerculesClient
  const agentManager = yield* HerculesAgentManager

  const { items: tasks } = yield* client.tasks.tasks({
    payload: { limit: 20 },
  })

  const score = calculateScore(
    {
      ...appConfig,
      currentTime: yield* DateTime.now,
    },
    tasks,
  )

  if (score > 100) {
    const currentInstanceCount = yield* agentManager.instanceCount()
    yield* agentManager.scale(currentInstanceCount * 2)
  }
})

const deps = Layer.merge(
  HerculesClient.Default,
  HerculesAgentManager.Default,
)

runMain(
  Effect.provide(program, deps),
)
