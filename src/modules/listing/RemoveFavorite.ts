import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import { getConnection } from 'typeorm'

import { Listing } from '../../entity/Listing'
import { User } from '../../entity/User'
import { MyContext } from '../../types/MyContext'

@Resolver()
export class RemoveFavoriteResolver {
  @Mutation(() => Boolean)
  async removeFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(ctx.req.session!.userId)
    const listing = await Listing.findOne({ sourceSystemId: listingId })

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
}
