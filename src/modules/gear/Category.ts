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
import { Category } from '../../entity/Category'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'

@Resolver()
export class CategoryResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Category], { nullable: true })
  async allCategories(@Ctx() ctx: MyContext): Promise<Category[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    return await Category.find({ relations: ['parent'] })
  }

  @Mutation(() => Category)
  async addCategory(
    @Arg('name') name: string,
    @Ctx() ctx: MyContext
  ): Promise<Category | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    const category = await Category.create({
      name
    }).save()

    return category
  }

  @Mutation(() => Boolean)
  async removeCategory(
    @Arg('id') id: number,
    @Ctx() ctx: MyContext
  ): Promise<boolean | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    const category = await Category.findOne({
      id
    })

    let removed
    if (category) {
      removed = await category.remove()
    }

    return !removed
  }

  @Mutation(() => Category)
  async addCategoryParent(
    @Arg('childId') childId: number,
    @Arg('parentId') parentId: number,
    @Ctx() ctx: MyContext
  ): Promise<Category | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    let child = await Category.findOne({
      id: childId
    })

    let parent = await Category.findOne({
      id: parentId
    })

    if (child && parent) {
      child.parent = parent
      let category = await child.save()
      return category
    }

    return undefined
  }

  @Subscription(() => Category, { topics: 'newCategory' })
  newCategory(@Root() payload: Category): Category {
    return payload
  }
}
