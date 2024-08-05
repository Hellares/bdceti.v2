import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Status } from "src/status/entities/status.entity";

@Entity('supports')
export class Support{
  @PrimaryGeneratedColumn()
  id: number;  

  @Column({ default: 'Ninguno' })
  device: string;

  @Column({ default: 'Ninguno' })
  brand: string;

  @Column({ default: 'Ninguno' })
  serial: string;

  @Column({ default: 'Ninguno' })
  componentA: string;

  @Column({ default: 'Ninguno' })
  componentB: string;

  @Column({ default: 'Ninguno' })
  componentC: string;

  @Column({ default: 'Ninguno' })
  accessories: string;

  @Column({
    nullable: true
  })
  image1: string;

  @Column({
    nullable: true
  })
  image2: string;

  @Column({
    nullable: true
  })
  image3: string;

  @Column({ default: '-' })
  descriptionFail: string;

  @Column({ default: '-' })
  solution: string;

  @Column({ default: '-' })
  technical: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @Column({
    type:'date', 
    default:() =>'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @Column({
    type:'date', 
    default:() =>'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;

  @ManyToOne(() => User, user => user.supports)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Status, status => status.support)//)//eager: true carga todas las relaciones de estado
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({default: 1})
  status_id: number;

  @BeforeInsert()
  @BeforeUpdate()
  setDefaultValues() {
    this.device = this.device || 'Ninguno';
    this.brand = this.brand || 'Ninguno';
    this.serial = this.serial || 'Ninguno';
    this.componentA = this.componentA || 'Ninguno';
    this.componentB = this.componentB || 'Ninguno';
    this.componentC = this.componentC || 'Ninguno';
    this.accessories = this.accessories || 'Ninguno';
    this.descriptionFail = this.descriptionFail || '-';
    this.solution = this.solution || '-';
    this.technical = this.technical || '-';
    this.image1 = this.image1 || 'https://res.cloudinary.com/doglf2gsy/image/upload/v1722206801/lunzignh36hftfuv6b6z.png';
    this.image2 = this.image2 || 'https://res.cloudinary.com/doglf2gsy/image/upload/v1722206801/lunzignh36hftfuv6b6z.png';
    this.image3 = this.image3 || 'https://res.cloudinary.com/doglf2gsy/image/upload/v1722206801/lunzignh36hftfuv6b6z.png';
    this.price = this.price || 0.00;
    this.status_id = this.status_id || 1;
  }

}