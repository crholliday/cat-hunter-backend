import { MiddlewareFn } from 'type-graphql'
import { Log } from '../../entity/Log'
import { LogType } from '../../types/LogType'
import { MyContext } from '../../types/MyContext'
import { pubsub } from '../../types/MyPubSub'

export const logger: MiddlewareFn<MyContext> = async (
  { context, info },
  next
) => {
  const user =
    context.req && context.req.session
      ? context.req.session!.userId || 'guest'
      : 'guest'
  const logMessage = `Logging access: ${user} -> ${info.parentType.name}.${
    info.fieldName
  }`

  let type =
    info.fieldName == 'refreshDatabase'
      ? LogType.REFRESHDATABASE
      : LogType.EVENT

  await next().then(async () => {
    await Log.insert({
      type: type,
      message: logMessage,
      createdDate: new Date()
    })
    await pubsub.publish('newRefreshDate', { refreshDate: new Date() })
  })
}
