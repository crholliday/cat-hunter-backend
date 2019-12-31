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

  @Mutation(() => User)
  async addFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    let user = await User.findOne({
      where: { id: ctx.req.session!.userId },
      relations: ['favorites']
    })
    const listing = await Listing.findOne({
      sourceSystemId: listingId
    })

    if (!user || !listing) {
      return undefined
    }

    await getConnection()
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .add(listing)

    let updated = await User.findOne({
      where: { id: ctx.req.session!.userId },
      relations: ['favorites']
    })

    return updated
  }

  @Mutation(() => User)
  async removeFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    let user = await User.findOne({
      where: { id: ctx.req.session!.userId },
      relations: ['favorites']
    })
    const listing = await Listing.findOne({
      sourceSystemId: listingId
    })

    if (!user || !listing) {
      return undefined
    }

    await getConnection()
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .remove(listing)

    let updated = await User.findOne({
      where: { id: ctx.req.session!.userId },
      relations: ['favorites']
    })

    return updated
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
