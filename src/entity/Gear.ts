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
export class Gear extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column('text', { unique: true })
  name: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  url?: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description?: string

  @Field()
  @Column('numeric', { precision: 2 })
  purchasePrice?: number

  @Field()
  @Column('numeric', { precision: 2 })
  installPrice?: number

  @Field()
  @Column({ default: new Date() })
  createdDate: Date

  @Field()
  @Column({ default: new Date() })
  modifiedDate: Date

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
