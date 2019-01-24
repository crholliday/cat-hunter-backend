import { MiddlewareFn } from 'type-graphql'

import { MyContext } from '../../types/MyContext'
import { Log } from '../../entity/Log'
import { LogType } from '../../types/LogType'

export const logger: MiddlewareFn<MyContext> = async (
  { context, info },
  next
) => {
  const logMessage = `Logging access: ${context.req.session!.userId} -> ${
    info.parentType.name
  }.${info.fieldName}`

  await next()
  Log.insert({ type: LogType.EVENT, message: logMessage })
}
