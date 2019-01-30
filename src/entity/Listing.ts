import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Listing extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  sourceSystem: string

  @Field()
  @Column()
  sourceSystemId: string

  @Field()
  @Column()
  make: string

  @Field()
  @Column()
  model: string

  @Field()
  @Column()
  year: number

  @Field()
  @Column({ type: 'float' })
  price: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string

  @Field({ nullable: true })
  @Column({ nullable: true, default: false })
  ownersVersion: boolean

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  length: number

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  beam: number

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  draft: number

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  displacement: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  cabins: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  doubleBerths: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  heads: number

  @Field()
  @Column()
  locationCity: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  locationCountry: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  locationCountryCode: string

  @Field()
  @Column()
  createdDate: Date

  @Field()
  @Column()
  modifiedDate: Date

  @Field()
  @Column({ default: new Date() })
  addedDate: Date

  @Field()
  @Column()
  url: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string
}

export interface NewRefreshPayload {
  refreshDate: Date
}
