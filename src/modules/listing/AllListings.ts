import { Resolver, Query, Ctx, UseMiddleware } from 'type-graphql'

import { Listing } from '../../entity/Listing'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'

@Resolver()
export class AllListingsResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Listing], { nullable: true })
  async allListings(@Ctx() ctx: MyContext): Promise<Listing[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    return Listing.find({
      order: {
        createdDate: 'DESC'
      }
    })
  }
}
