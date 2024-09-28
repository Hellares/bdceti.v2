import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { Support } from './entities/support.entity';
import { Repository, DataSource } from 'typeorm';
import { Status } from 'src/status/entities/status.entity';
import { FilesService } from 'src/files/files.service';
import { CreateSupportDto } from './dto/create-support.dto';
import async_foreach = require('../utils/async_foreach.js');
import { UpdateSupportDto } from './dto/update-support.dto';
import { User } from 'src/users/entities/user.entity';
import { clear } from 'console';
import { use } from 'passport';
import { CustomDatabaseException } from 'src/utils/custom_database_exception';


interface SupportStats {
  total_registros: number;
  total_registrado: number;
  total_reparando: number;
  total_reparado: number;
  total_entregado: number;
  precio_promedio: number;
  total_marcas: number;
  total_dispositivos: number;
}

@Injectable()
export class SupportService {
  private logger = new Logger();
  constructor(
    @InjectRepository(Support) private supportRepository: Repository<Support>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
    // @InjectRepository(Status) private statusRepository: Repository<Status>,
    private readonly filesService: FilesService,
  ){}

  // async createSupport(files: Array<Express.Multer.File>, support: CreateSupportDto) {
  //   if (files.length === 0) {
  //     throw new HttpException('Al menos una imagen es obligatoria', HttpStatus.BAD_REQUEST);
  //   }
  
  //   const newSupport = this.supportRepository.create(support);
  //   let savedSupport = await this.supportRepository.save(newSupport);
  
  //   const imageFields = ['image1', 'image2', 'image3'];
  //   const uploadPromises = files.slice(0, 3).map(async (file, index) => {
  //     const { secure_url } = await this.filesService.uploadImage(file);
  //     if (secure_url) {
  //       savedSupport[imageFields[index]] = secure_url;
  //     }
  //   });
  
  //   await Promise.all(uploadPromises);
    
  //   savedSupport = await this.supportRepository.save(savedSupport);
  
  //   savedSupport = await this.supportRepository.findOne({
  //     where: { id: savedSupport.id },
  //     relations: ['user'],
  //     select: {
  //       user: {
  //         id: true,
  //         name: true,
  //         lastname: true,
  //         phone: true,
  //         // Añade aquí otros campos del usuario que quieras incluir
  //       }
  //     }
  //   });
  
  //   return savedSupport;
  // }

  async createSupport(files: Array<Express.Multer.File>, support: CreateSupportDto) {
    const newSupport = this.supportRepository.create(support);
    let savedSupport = await this.supportRepository.save(newSupport);
  
    const imageFields = ['image1', 'image2', 'image3'];
    
    const uploadPromises = files.slice(0, 3).map(async (file, index) => {
      const { secure_url } = await this.filesService.uploadImage(file);
      if (secure_url) {
        savedSupport[imageFields[index]] = secure_url;
      }
    });
  
    await Promise.all(uploadPromises);
    
    savedSupport = await this.supportRepository.save(savedSupport);
  
    savedSupport = await this.supportRepository.findOne({
      where: { id: savedSupport.id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          lastname: true,
          phone: true,
          // Añade aquí otros campos del usuario que quieras incluir
        }
      },
      
    });
    return savedSupport;
  }

  async findByIdClient(userId: number): Promise<Support[]> {
    const supports = await this.supportRepository.find({
      where: { user_id: userId },
      relations: ['user', 'status'],
      select: {
        user: {
          id: true,
          name: true,
          lastname: true,
          phone: true,
          // Añade aquí otros campos del usuario que quieras incluir
        },
        status: {
          id: true,
          name: true,
          image: true,
        },
      },
    });
    if (supports.length === 0) {
      throw new NotFoundException(`No se encontraron soportes para el cliente con ID ${userId}`);
    }
    
    return supports;
  }
  
  async findByUserIdOrDni(id: number, dni: string): Promise<Support[]> {
    try {
      const supports = await this.supportRepository.createQueryBuilder('support')
        .innerJoinAndSelect('support.user', 'user')
        .innerJoinAndSelect('support.status', 'status')
        .where('user.id = :id OR user.dni = :dni', { id, dni })
        .select([
          'support.id',
          'support.device',
          'support.brand',
          'support.serial',
          'support.componentA',
          'support.componentB',
          'support.componentC',
          'support.accessories',
          'support.image1',
          'support.image2',
          'support.image3',
          'support.descriptionFail',
          'support.solution',
          'support.technical',
          'support.price',
          'support.created_at',
          'support.updated_at',
          'support.user_id',
          'support.status_id',
          'user.id',
          'user.name',
          'user.lastname',
          'user.phone',
          'status.id',
          'status.name',
          'status.image'
        ])
        .getMany();
      if(supports.length === 0){
        throw new CustomDatabaseException('Error al buscar soportes. Por favor, inténtelo de nuevo más tarde---.');
      }
      this.logger.log(`Se encontraron ${supports.length} soportes para el usuario con ID ${id}`);      
      return supports;
    } catch (error) {
      this.logger.error(`Error al buscar soportes para el usuario con ID ${id} o DNI ${dni}`);
      throw new CustomDatabaseException('Error al buscar soportes. Por favor, inténtelo de nuevo más tarde.');
    }
  }

  async findByIdStatus(statusId: number): Promise<Support[]> {
    const supports = await this.supportRepository.find({
      where: { status_id: statusId },
      relations: ['user', 'status'],
      select: {
        user: {
          id: true,
          name: true,
          lastname: true,
          phone: true,
          // Añade aquí otros campos del usuario que quieras incluir
        },
        status: {
          id: true,
          name: true,
        },
      },
    });
    if (supports.length === 0) {
      throw new NotFoundException(`No se encontraron soportes con el estado con ID ${statusId}`);
    }
    return supports;
  }

  async softDelete(id: number): Promise<void> {
    await this.userRepository.update(id, { isActive : false });
  }

  async updateStatus(update: UpdateSupportDto): Promise<Support> { // FECHA DE CAMBIO DE ESTADO-REPARANDO Y REPARADO
    const support = await this.supportRepository.findOne({ where: { id: update.id } });
    if (!support) {
      throw new NotFoundException(`Support with ID ${update.id} not found`);
    }
    const newStatusId = Number(update.status_id);
    support.status_id = newStatusId;
    
    if (newStatusId === 4) {
      support.delivered_at = new Date(moment().tz('America/Lima').format());
    } else{
      support.updateStatus_at = new Date(moment().tz('America/Lima').format());
    }

    const updatedSupport  = await this.supportRepository.save(support);
    return updatedSupport;
  }

  async getSupportsByStatusCount(){
    try {
      const result = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total_registros,
          SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as total_registrado,
          SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as total_reparando,
          SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as total_reparado,
          SUM(CASE WHEN status_id = 4 THEN 1 ELSE 0 END) as total_entregado,
          AVG(price) as precio_promedio,
          COUNT(DISTINCT brand) as total_marcas,
          COUNT(DISTINCT device) as total_dispositivos
        FROM 
          supports
      `);
      
      return result[0];
    } catch (error) {
      console.error('Error al obtener estadísticas de soporte:', error);
      throw new Error('No se pudieron obtener las estadísticas de soporte');
    }
  }







  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  
}
