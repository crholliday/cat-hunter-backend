import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Category } from '../../entity/Category'
import { Link } from '../../entity/Link'
import { User } from '../../entity/User'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'
import { LinkInput } from './LinkInput'

@Resolver()
export class LinkResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Link], { nullable: true })
  async allLinks(@Ctx() ctx: MyContext): Promise<Link[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    return await Link.find({
      relations: ['category', 'category.parent', 'user']
    })
  }

  @Mutation(() => Link)
  async upsertLink(
    @Arg('data') linkInput: LinkInput,
    @Ctx() ctx: MyContext
  ): Promise<Link | undefined> {
    const user = await User.findOne(ctx.req.session!.userId)
    if (!user) {
      return undefined
    }

    const link = await Link.create({ ...linkInput, user: user })

    if (linkInput.categoryInput) {
      const category = await Category.findOne(linkInput.categoryInput.id)
      if (category) {
        link.category = category
      }
    }

    const saved = await link.save()
    if (saved) {
      return await Link.findOne(saved.id, {
        relations: ['category', 'category.parent', 'user']
      })
    } else {
      return saved
    }
  }

  @Mutation(() => Boolean)
  async removeLink(
    @Arg('id') id: number,
    @Ctx() ctx: MyContext
  ): Promise<boolean | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    const link = await Link.findOne({
      id
    })

    let removed
    if (link) {
      removed = await link.remove()
    }

    return !removed
  }
}
