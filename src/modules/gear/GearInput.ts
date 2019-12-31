import { IsUrl, Length } from 'class-validator'
import { Field, InputType } from 'type-graphql'
import { Gear } from '../../entity/Gear'
import { CategoryInput } from './CategoryInput'

@InputType()
export class GearInput implements Partial<Gear> {
  @Field({ nullable: true })
  id?: number

  @Field({ nullable: true })
  @Length(1, 50)
  name?: string

  @Field({ nullable: true })
  @IsUrl()
  url?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  purchasePrice?: number

  @Field({ nullable: true })
  installPrice?: number

  @Field({ nullable: true })
  modifiedDate?: Date

  @Field(() => CategoryInput)
  categoryInput: CategoryInput
}
