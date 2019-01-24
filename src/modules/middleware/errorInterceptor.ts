import { MiddlewareFn } from 'type-graphql'
import { Log } from '../../entity/Log'
import { LogType } from '../../types/LogType'

export const ErrorInterceptor: MiddlewareFn<any> = async (
  { context, info },
  next
) => {
  try {
    return await next()
  } catch (err) {
    // write error to file log
    const logMessage = `{
      error: ${err},
      context: ${context},
      info: ${info}
    }`
    Log.insert({ type: LogType.ERROR, message: logMessage })

    // rethrow the error
    throw err
  }
}
