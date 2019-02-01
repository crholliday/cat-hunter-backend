import bcrypt from 'bcryptjs'
import { MyContext } from 'src/types/MyContext'
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { User } from '../../entity/User'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'
import { RegisterInput } from './register/RegisterInput'

@Resolver()
export class RegisterResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => String)
  async hello() {
    return 'Hello World!'
  }

  @Mutation(() => User)
  async register(
    @Arg('data')
    { email, fullName, password }: RegisterInput,
    @Ctx() ctx: MyContext
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword
    }).save()

    ctx.req.session!.userId = user.id

    return user
  }
}
