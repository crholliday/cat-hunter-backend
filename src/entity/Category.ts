import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Gear } from './Gear'
import { Link } from './Link'

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column('text', { unique: true })
  name: string

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category)
  parent?: Category

  @Field(() => [Gear])
  @OneToMany(() => Gear, gear => gear.category, { eager: true, cascade: true })
  gear: Gear[]

  @Field(() => [Link])
  @OneToMany(() => Link, link => link.category, { eager: true, cascade: true })
  link: Link[]
}
