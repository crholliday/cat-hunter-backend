import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'
import { InsertResult } from 'typeorm'
import { Log } from '../../entity/Log'
import { LogType } from '../../types/LogType'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'

@Resolver()
export class LogResolver {
  @UseMiddleware(isAuth)
  @Query(() => [Log], { nullable: true })
  async allLogs(
    @Arg('type', { nullable: true }) type: LogType,
    @Ctx() ctx: MyContext
  ): Promise<Log[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    return await Log.find({
      where: { type: type },
      order: {
        createdDate: 'DESC'
      }
    })
  }

  @UseMiddleware(isAuth)
  @Query(() => Date, { nullable: true })
  async getLastRefreshDate(@Ctx() ctx: MyContext): Promise<Date | null> {
    if (!ctx.req.session!.userId) {
      return null
    }

    const latest = await Log.find({
      where: { type: LogType.REFRESHDATABASE },
      order: {
        createdDate: 'DESC'
      }
    })

    return latest.length > 0 ? latest[0].createdDate : null
  }

  async addLog(message: string, type: LogType): Promise<InsertResult> {
    let res = await Log.insert({ type: type, message: message })
    return res
  }
}
