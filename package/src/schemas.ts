import { Match, Schema } from 'effect'

export class Task extends Schema.Class<Task>('Task')({
  creationTime: Schema.DateTimeUtc,
}) {}

const TaskApiEncoded = Schema.Struct({
  creationTime: Schema.String,
})

const TaskApiResponse = Schema.Union(
  Schema.Struct({ Build: TaskApiEncoded }),
  Schema.Struct({ Effect: TaskApiEncoded }),
  Schema.Struct({ Evaluation: TaskApiEncoded }),
)

const TaskFromApiResponse = Schema.transform(
  TaskApiResponse,
  Task,
  {
    strict: true,
    decode: x =>
      Match
        .value(x)
        .pipe(
          Match.when({ Build: Match.any }, x => x.Build),
          Match.when({ Effect: Match.any }, x => x.Effect),
          Match.when({ Evaluation: Match.any }, x => x.Evaluation),
          Match.exhaustive,
          x => x,
        ),
    encode: Effect => ({ Effect }),
  },
)

export const TasksApiResponse = Schema.Struct({
  items: Schema.Array(TaskFromApiResponse),
})
