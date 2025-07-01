import { describe, expect, it } from '@effect/vitest'
import { Option } from 'effect'
import {
  type AutoScalerDecisionInput,
  calculateTargetInstanceCount,
} from './AutoScaler.js'

describe('AutoScaler.calculateTargetInstanceCount', () => {
  const input: AutoScalerDecisionInput = {
    minRunnersCount: 1,
    maxRunnersCount: 10,
    scaleUpThreshold: 5,
    scaleUpFactor: 2,
    qeuedTasksCount: 6,
    currentInstanceCount: 3,
  }

  it('scales up by scaleUpFactor if qeuedTasksCount > scaleUpThreshold', () => {
    expect(calculateTargetInstanceCount(input)).toEqual(Option.some(6))
  })

  it('rounds up target count', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      scaleUpFactor: 1.1,
    }))
      .toEqual(Option.some(4))
  })

  it('does not scales if qeuedTasksCount <= scaleUpThreshold && qeuedTasksCount != 0', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      qeuedTasksCount: input.scaleUpThreshold,
    }))
      .toEqual(Option.none())

    expect(calculateTargetInstanceCount({
      ...input,
      qeuedTasksCount: input.scaleUpThreshold - 1,
    }))
      .toEqual(Option.none())
  })

  it('clamps target instance count to maxRunnersCount on scale up', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      currentInstanceCount: 6,
    }))
      .toEqual(Option.some(input.maxRunnersCount))
  })

  it('does not issue scale up if currentInstanceCount == target count', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      qeuedTasksCount: input.scaleUpThreshold,
      currentInstanceCount: input.maxRunnersCount,
    }))
      .toEqual(Option.none())
  })

  it('scales down to minRunnersCount if qeuedTasksCount == 0', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      qeuedTasksCount: 0,
    }))
      .toEqual(Option.some(input.minRunnersCount))
  })

  it('does not issue scale down if currentInstanceCount == target count', () => {
    expect(calculateTargetInstanceCount({
      ...input,
      qeuedTasksCount: 0,
      currentInstanceCount: input.minRunnersCount,
    }))
      .toEqual(Option.none())
  })
})
