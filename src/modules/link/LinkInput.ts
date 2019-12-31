import { IsUrl } from 'class-validator'
import { Field, InputType } from 'type-graphql'
import { Link } from '../../entity/Link'
import { CategoryInput } from '../gear/CategoryInput'

@InputType()
export class LinkInput implements Partial<Link> {
  @Field({ nullable: true })
  id?: number

  @Field({ nullable: true })
  @IsUrl()
  url?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => CategoryInput, { nullable: true })
  categoryInput?: CategoryInput
}
