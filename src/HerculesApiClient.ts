import {
  FetchHttpClient,
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpClient,
  HttpClientRequest,
  OpenApi,
} from '@effect/platform'
import { BadRequest } from '@effect/platform/HttpApiError'
import { Config, Effect, pipe, Redacted, Schema } from 'effect'
import { TasksApiResponse } from './schemas.ts'

const Qeury = Schema.Struct({
  state: pipe(
    Schema.Literal('Ready'),
    Schema.optional,
    Schema.withConstructorDefault(() => 'Ready' as const),
  ),
  limit: Schema.compose(
    Schema.NumberFromString,
    Schema.Positive,
  ),
})

export const tasksEndpoint = HttpApiEndpoint
  .get('tasks', '/accounts/me/default-cluster/tasks')
  .addSuccess(TasksApiResponse)
  .addError(BadRequest)
  .setPayload(Qeury)
  .annotateContext(OpenApi.annotations({
    description: 'Get user information',
  }))

export const tasksGroup = HttpApiGroup
  .make('tasks')
  .add(tasksEndpoint)

export const HerculesApiSpec = HttpApi
  .make('HerculesApi')
  .add(tasksGroup)
  .annotateContext(
    OpenApi.annotations({ title: 'Hercules API' }),
  )

const makeHerculesApiClient = Effect.gen(function*() {
  const baseUrl = yield* Config.string('API_URL')
  const apiToken = yield* Config.redacted('API_TOKEN')

  const client = yield* HttpApiClient.make(HerculesApiSpec, {
    baseUrl,
    transformClient: client =>
      client.pipe(
        HttpClient.mapRequest(
          HttpClientRequest.bearerToken(Redacted.value(apiToken)),
        ),
      ),
  })
  return client
})

export class HerculesClient
  extends Effect.Service<HerculesClient>()('HerculesClient', {
    effect: makeHerculesApiClient,
    dependencies: [FetchHttpClient.layer],
  })
{}
