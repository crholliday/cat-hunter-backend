import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Listing } from './Listing'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  firstName: string

  @Field()
  @Column()
  lastName: string

  @Field()
  @Column('text', { unique: true })
  email: string

  @Field(() => [Listing], { nullable: true })
  @ManyToMany(() => Listing)
  @JoinTable()
  favorites?: Listing[]

  @Column()
  password: string
}
