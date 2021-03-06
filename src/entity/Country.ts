import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'

@Entity()
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  abbreviation: string

  @Column()
  name: string
}
