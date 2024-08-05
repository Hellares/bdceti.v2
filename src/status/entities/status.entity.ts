import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Support } from "src/support/entities/support.entity";

@Entity('status')
export class Status{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  // @OneToMany(()=>Support, support => support.status)
  // supports: Support[];
  @OneToMany(() => Support, support => support.status)
  support: Support[];
}