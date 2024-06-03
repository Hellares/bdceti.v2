import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";

@Entity({name: 'roles'})
export class Rol{

  @PrimaryColumn()
  id: string;

  @Column({unique: true})
  name: string;

  @Column()
  image: string;

  @Column()
  route: string;

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

  @ManyToMany(()=>User, (user)=> user.roles)
  users: User[]
}