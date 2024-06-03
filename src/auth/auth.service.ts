import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Rol } from 'src/roles/entities/rol.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Rol) private rolesRepository: Repository<Rol>,
    private jwtService: JwtService,
  ){}

  async register(user: RegisterAuthDto ){
    try {      
      const newUser = this.usersRepository.create(user);
      let rolesIds = [];
      if(user.rolesIds !== undefined && user.rolesIds !== null ){
        rolesIds = user.rolesIds;
      }else{
        rolesIds.push('CLIENT');
      }
      const roles = await this.rolesRepository.findBy({id: In(rolesIds)})
      newUser.roles = roles;
      const userSaved = await this.usersRepository.save(newUser);
      const rolesString = userSaved.roles.map(rol => rol.id);

      const payload = { id: userSaved.id, dni: userSaved.dni, name: userSaved.name, isActive: userSaved.isActive, roles: rolesString };
      const token = this.jwtService.sign(payload);
      const data = {
        user: userSaved,
        token: 'Bearer ' + token
      }
      delete data.user.password;
      return data;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginData: LoginAuthDto){

    const { dni, password } = loginData;
    const userFound = await this.usersRepository.findOne({ 
      where:{ dni: dni},
      relations: ['roles']
    });    
    if(!userFound){
      throw new HttpException('El DNI/RUC no existe', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await compare(password, userFound.password);
    if(!isPasswordValid){
      throw new UnauthorizedException('La contraseña es incorrecta');
    }
    const rolesIds = userFound.roles.map(rol => rol.id);

    const payload = { id: userFound.id, dni: userFound.dni, name: userFound.name, isActive: userFound.isActive, roles: rolesIds };
    const token = this.jwtService.sign(payload);
    const data = {
      user: userFound,
      token: 'Bearer ' + token
    }
    delete data.user.password;
    return data;

  }

  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
