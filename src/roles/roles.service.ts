import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';
import { CreateRolDto } from './entities/dto/create-rol.dto';

@Injectable()
export class RolesService {

  constructor(@InjectRepository(Rol) private rolesRepository: Repository<Rol>){}

  create(rol: CreateRolDto){
    const newRol = this.rolesRepository.create(rol);
    return this.rolesRepository.save(newRol);
  }
}
