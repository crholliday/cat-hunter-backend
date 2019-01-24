import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'

import { Listing } from '../../entity/Listing'
import { User } from '../../entity/User'
import { MyContext } from '../../types/MyContext'
import { getConnection } from 'typeorm'

@Resolver()
export class AddFavoriteResolver {
  @Mutation(() => Boolean)
  async addFavorite(
    @Arg('listingId') listingId: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ id: ctx.req.session!.userId })
    const listing = await Listing.findOne({ sourceSystemId: listingId })

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
}
