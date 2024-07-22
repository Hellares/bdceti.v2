import { Component } from "src/component/entities/component.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'devices'})
export class Device {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  name: string;

  @Column({nullable: true})
  image: string;

  @OneToMany(() => Component, (component) => component.device)
  components: Component[];
}