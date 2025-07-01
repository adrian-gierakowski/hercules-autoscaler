import { Effect } from 'effect'

export class HerculesAgentManager
  extends Effect.Service<HerculesAgentManager>()('HerculesAgentManager', {
    effect: Effect.gen(function*() {
      let currentInstanceCount = 2
      return {
        scale: (targetInstanceCount: number) =>
          Effect.sync(() => {
            currentInstanceCount = targetInstanceCount
          }),
        instanceCount: () => Effect.succeed(currentInstanceCount),
      }
    }),
  })
{}
