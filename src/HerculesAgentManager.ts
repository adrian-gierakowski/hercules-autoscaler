import { Effect } from 'effect'

export class HerculesAgentManager
  extends Effect.Service<HerculesAgentManager>()('HerculesAgentManager', {
    succeed: {
      scale: (_targetInstances: number) => Effect.void,
      instanceCount: () => Effect.succeed(1),
    },
  })
{}
