import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Category } from '../../entity/Category'
import { Gear } from '../../entity/Gear'
import { MyContext } from '../../types/MyContext'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'
import { GearInput } from './GearInput'

@Resolver()
export class GearResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => [Gear], { nullable: true })
  async allGear(@Ctx() ctx: MyContext): Promise<Gear[] | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    return await Gear.find({ relations: ['category', 'category.parent'] })
  }

  @Mutation(() => Gear)
  async upsertGear(
    @Arg('data') gearInput: GearInput,
    @Ctx() ctx: MyContext
  ): Promise<Gear | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }

    const gear = await Gear.create(gearInput)

    if (gearInput.categoryInput) {
      const category = await Category.findOne(gearInput.categoryInput.id)
      if (category) {
        gear.category = category
      }
    }

    return await gear.save()
  }

  @Mutation(() => Boolean)
  async removeGear(
    @Arg('id') id: number,
    @Ctx() ctx: MyContext
  ): Promise<boolean | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    const gear = await Gear.findOne({
      id
    })

    let removed
    if (gear) {
      removed = await gear.remove()
    }

    return !removed
  }
}
