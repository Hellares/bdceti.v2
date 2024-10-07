import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as moment from 'moment-timezone';
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
  component_a: string;

  @Column({ default: 'Ninguno' })
  component_b: string;

  @Column({ default: 'Ninguno' })
  component_c: string;

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
  description_fail: string;

  @Column({ default: '-' })
  solution: string;

  @Column({ default: '-' })
  technical: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  //--
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  estimated_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  final_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  deposit_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  remaining_balance: number;
  //--

  @Column({  //fecha de creacion
    type:'timestamp', 
    default:() =>'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @Column({ //fecha de actualizacion de estado
    type:'timestamp', 
    default:() =>'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  update_status_at: Date;

  @Column({ //fecha de entrega al cliente
    type:'timestamp', 
    default:() =>'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  delivered_at: Date;

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
  setCreatedAtToPeruTime() {
    this.created_at = new Date(moment().tz('America/Lima').format());
  }

  @BeforeInsert()
  @BeforeUpdate()
  setDefaultValues() {
    this.device = this.device || 'Ninguno';
    this.brand = this.brand || 'Ninguno';
    this.serial = this.serial || 'Ninguno';
    this.component_a = this.component_a || 'Ninguno';
    this.component_b = this.component_b || 'Ninguno';
    this.component_c = this.component_c || 'Ninguno';
    this.accessories = this.accessories || 'Ninguno';
    this.description_fail = this.description_fail || '-';
    this.solution = this.solution || '-';
    this.technical = this.technical || '-';
    this.image1 = this.image1 || '-';
    this.image2 = this.image2 || '-';
    this.image3 = this.image3 || '-';
    this.price = this.price || 0.00;
    this.status_id = this.status_id || 1;
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculatePrices() {
    this.estimated_price = this.estimated_price || 0.00;
    this.final_price = this.final_price || this.estimated_price;
    this.deposit_amount = this.deposit_amount || 0.00;
    this.remaining_balance = Math.max(0, this.final_price - this.deposit_amount);
  }

  // @BeforeUpdate()
  // updateTimestamps() {
  //   this.updateStatus_at = new Date(moment().tz('America/Lima').format());
  // }

  // @BeforeUpdate()
  // updateDeliveredAt() {
  //   this.delivered_at = new Date(moment().tz('America/Lima').format());
  // }
}