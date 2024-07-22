import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    

    private readonly fileService: FilesService
  ){}

  create(user: CreateUserDto){
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
  
  async findAll(paginationDto: PaginationDto){
    const {limit = 50, offset = 0 } = paginationDto;
    const usersFounds = await this.userRepository.find({
      where: {
        isActive: true,
      },
      take: limit,
      skip: offset,
      relations: ['roles'],
      order: {
        id: 'DESC',
      }
    })
    return usersFounds;
  }

  async findOne( identifier: string ): Promise<User> { //BUSCA USUARIO POR DNI Y NOMBRE
    let user: User;
      user = await this.userRepository.findOne({
        where: {
          dni: identifier,
          isActive: true,
        },
        relations: ['roles']
      });
    // Si no se encuentra, intentar buscar por name usando QueryBuilder
    if (!user) {
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      user = await queryBuilder
      .where('LOWER(user.name) = LOWER(:name)', { name: identifier })
      .andWhere('user.isActive = true').leftJoinAndSelect('user.roles', 'roles').getOne();
    }
    if (!user) {
      throw new NotFoundException(`Usuario con identificador: ${identifier} no encontrado`);
    }
    return user;
  }

  async update(id: number, user: UpdateUserDto){

    try {
      const userFound = await this.userRepository.findOneBy({id: id});
      if(!userFound){
        throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);
      }      
      const updateUser = Object.assign(userFound, user);
      return this.userRepository.save(updateUser);      
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async updateUserImage(image: Express.Multer.File, id: number, user: UpdateUserDto){
    
    const {secure_url} = await this.fileService.uploadImage(image);
    //console.log('URL: ' + secure_url);

    if(secure_url === undefined && secure_url === null ){
      throw new HttpException('La imagen no se puedo guardar', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const userFound = await this.userRepository.findOneBy({id: id});
    if(!userFound){
      throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);
    }  
    
    user.image = secure_url;

    const updatedUser = Object.assign(userFound, user);
    return this.userRepository.save(updatedUser);
  }

  async softDelete(id: number): Promise<void> {
    await this.userRepository.update(id, { isActive : false });
  }

  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
