import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'

@Entity()
export class Model extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string
}
