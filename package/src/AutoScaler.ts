import { Array, DateTime, Duration, Effect, Number, Option } from 'effect'
import { HerculesAgentManager } from './HerculesAgentManager.js'
import { HerculesClient } from './HerculesApiClient.js'
import { countQueuedTasks } from './lib.js'

type AutoScalerDecisionConfig = {
  maxRunnersCount: number
  minRunnersCount: number
  scaleUpThreshold: number
  scaleUpFactor: number
}
export type AutoScalerDecisionInput = AutoScalerDecisionConfig & {
  qeuedTasksCount: number
  currentInstanceCount: number
}

export type AutoScalerRunConfig = AutoScalerDecisionConfig & {
  maxAge: Duration.Duration
  minAge: Duration.Duration
  agentSystem: string
}

export const calculateTargetInstanceCount = ({
  maxRunnersCount,
  minRunnersCount,
  scaleUpThreshold,
  scaleUpFactor,
  qeuedTasksCount,
  currentInstanceCount,
}: AutoScalerDecisionInput): Option.Option<number> => {
  const targetRunnerCount = (qeuedTasksCount > scaleUpThreshold)
    ? Number.clamp(
      currentInstanceCount * scaleUpFactor,
      {
        minimum: minRunnersCount,
        maximum: maxRunnersCount,
      },
    )
    : qeuedTasksCount === 0
    ? minRunnersCount
    : currentInstanceCount

  return targetRunnerCount == currentInstanceCount
    ? Option.none()
    : Option.some(Math.ceil(targetRunnerCount))
}

export class AutoScaler extends Effect.Service<AutoScaler>()('AutoScaler', {
  effect: Effect.gen(function*() {
    const client = yield* HerculesClient
    const agentManager = yield* HerculesAgentManager

    return {
      run: Effect.fn('AutoScaler.run')(function*(options: AutoScalerRunConfig) {
        const { items: tasks } = yield* client.tasks.tasks({
          payload: { limit: 20 },
        })

        const qeuedTasksCount = countQueuedTasks(
          {
            ...options,
            currentTime: yield* DateTime.now,
          },
          Array.filter(tasks, task => task.system === options.agentSystem),
        )

        const currentInstanceCount = yield* agentManager.instanceCount()

        const decisionInput = {
          ...options,
          qeuedTasksCount,
          currentInstanceCount,
        }
        yield* Effect.log('decision input', decisionInput)

        const targetRunnerCount = calculateTargetInstanceCount({
          ...options,
          qeuedTasksCount,
          currentInstanceCount,
        })

        yield* Effect.log('decision result', targetRunnerCount)

        if (Option.isSome(targetRunnerCount)) {
          yield* agentManager.scale(targetRunnerCount.value)
        }
      }),
    }
  }),
  dependencies: [
    HerculesClient.Default,
    HerculesAgentManager.Default,
  ],
}) {}
