import { Device } from "src/device/entities/device.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'components'})
export class Component {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  
  @ManyToOne(() => Device, (device) => device.components)
  device: Device;
}