import { Category } from 'src/entity/Category'
import { Field, InputType } from 'type-graphql'
import { GearInput } from './GearInput'

@InputType()
export class CategoryInput implements Partial<Category> {
  @Field({ nullable: true })
  id?: number

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  parentInput?: CategoryInput

  @Field(() => [GearInput], { nullable: true })
  gearInput?: GearInput[]

  @Field({ nullable: true })
  userId?: number
}
