import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Listing, NewRefreshPayload } from '../../entity/Listing'
import { User } from '../../entity/User'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'

@Resolver()
export class ListingResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Listing], { nullable: true })
  async allListings(@Ctx() ctx: MyContext): Promise<Listing[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    return await Listing.find({
      order: {
        createdDate: 'DESC'
      }
    })
  }

  @Mutation(() => Boolean)
  async addFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ id: ctx.req.session!.userId })
    const listing = await Listing.findOne({
      sourceSystemId: listingId
    })

    if (!user || !listing) {
      return false
    }

    await getConnection()
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .add(listing)

    return true
  }

  @Mutation(() => Boolean)
  async removeFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(ctx.req.session!.userId)
    const listing = await Listing.findOne({
      sourceSystemId: listingId
    })

    if (!user || !listing) {
      return false
    }

    await getConnection()
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .remove(listing)

    return true
  }

  @Subscription(() => Listing, { topics: 'newListing' })
  newListing(@Root() payload: Listing): Listing {
    return payload
  }

  @Subscription({ topics: 'newRefreshDate' })
  newRefreshDate(@Root() payload: NewRefreshPayload): Date {
    return payload.refreshDate
  }
}
