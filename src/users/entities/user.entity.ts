import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { hash } from 'bcrypt';
import { Rol } from "src/roles/entities/rol.entity";

@Entity({name: 'users'})

export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  dni: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column({
    unique: true
  })
  email: string;

  @Column({
    unique: true
  })
  phone: string;

  @Column()
  password: string;

  @Column({
    nullable: true
  })
  image: string;

  @Column({
    nullable: true
  })
  notification_token: string;

  @Column({
    default: true
  })
  isActive: boolean;

  @Column({
    type:'date', 
    default:() =>'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @Column({
    type:'date', 
    default:() =>'CURRENT_TIMESTAMP'
  })
  updated_at: Date;

  @JoinTable({
    name: 'user_has_roles',
    joinColumn:{
      name: 'id_user'
    },
    inverseJoinColumn:{
      name: 'id_rol'
    }
  })
  @ManyToMany(() => Rol, (rol) => rol.users)
  roles: Rol[];

  @BeforeInsert()
  async hashPassword(){
    this.password = await hash(this.password, Number(process.env.HASH_SALT))
  }
}