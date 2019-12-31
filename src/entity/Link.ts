import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Category } from './Category'
import { User } from './User'

@ObjectType()
@Entity()
export class Link extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column('text')
  url: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description?: string

  @Field()
  @Column({ default: new Date() })
  createdDate: Date

  @Field(() => User)
  @ManyToOne(() => User, user => user.id, {
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, category => category.id, {
    onDelete: 'CASCADE'
  })
  category: Category
}
