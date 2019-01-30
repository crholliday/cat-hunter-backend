import { Field, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { LogType } from '../types/LogType'

@ObjectType()
@Entity()
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => LogType)
  @Column({
    type: 'enum',
    enum: LogType,
    default: LogType.GENERAL
  })
  type: LogType

  @Field()
  @Column()
  message: string

  @Field()
  @Column({ default: new Date() })
  createdDate: Date
}
