import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Listing } from './Listing'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field({ defaultValue: 'No name', nullable: true })
  @Column({ default: 'No name', nullable: true })
  fullName: string

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
