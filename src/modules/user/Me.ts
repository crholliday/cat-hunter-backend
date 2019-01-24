import { Resolver, Query, Ctx, UseMiddleware } from 'type-graphql'

import { User } from '../../entity/User'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'

@Resolver()
export class MeResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    return User.findOne(ctx.req.session!.userId, { relations: ['favorites'] })
  }
}
