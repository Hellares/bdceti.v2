import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { plainToInstance } from 'class-transformer';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ){}

  private transformNumericFields(support: Partial<Support>): Partial<Support> {
    const numericFields = ['estimated_price', 'final_price', 'deposit_amount', 'remaining_balance'];
    numericFields.forEach(field => {
      if (support[field] !== undefined && support[field] !== null) {
        support[field] = parseFloat(support[field].toString());
      }
    });
    return support;
  }

  private async saveSupportAndInvalidateCache(support: Support): Promise<Support> {
    const savedSupport = await this.supportRepository.save(support);
    await this.invalidateSupportCache(savedSupport.status_id);
    return this.formatSupportResponse(savedSupport);
  }

  private async formatSupportResponse(support: Support): Promise<Support> {
    const formattedData = { ...support };
    const numericFields = ['estimated_price', 'final_price', 'deposit_amount', 'remaining_balance'];
    numericFields.forEach(field => {
      if (formattedData[field] !== null && formattedData[field] !== undefined) {
        formattedData[field] = parseFloat(formattedData[field].toString()).toFixed(2);
      }
    });

    // Fetch user details if not already included
    if (!formattedData.user) {
      const supportWithUser = await this.supportRepository.findOne({
        where: { id: support.id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            name: true,
            lastname: true,
            phone: true,
          }
        },
      });
      if (supportWithUser) {
        formattedData.user = supportWithUser.user;
      }
    }
    const formattedSupport = plainToInstance(Support, formattedData);

    return formattedSupport;
  }
  
  
  async createSupport(files: Express.Multer.File[] | undefined, supportDto: CreateSupportDto): Promise<Support> {
    try {
      let newSupport = this.supportRepository.create(this.transformNumericFields(supportDto));
      newSupport = await this.supportRepository.save(newSupport);

      if (files && files.length > 0) {
        const imageFields = ['image1', 'image2', 'image3'];
        const uploadPromises = files.slice(0, 3).map(async (file, index) => {
          try {
            const { secure_url } = await this.filesService.uploadImage(file);
            if (secure_url) {
              newSupport[imageFields[index]] = secure_url;
            }
          } catch (error) {
            this.logger.error(`Error uploading image ${index + 1}:`, error);
          }
        });
        await Promise.all(uploadPromises);
        newSupport = await this.supportRepository.save(newSupport);
      }

      return this.saveSupportAndInvalidateCache(newSupport);
    } catch (error) {
      this.logger.error('Error in createSupport:', error);
      throw new InternalServerErrorException('Error creating support');
    }
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
    const oldStatusId = support.status_id;
    const newStatusId = Number(update.status_id);
    support.status_id = newStatusId;
    
    if (newStatusId === 4) {
      support.delivered_at = new Date(moment().tz('America/Lima').format());
    } else{
      support.update_status_at = new Date(moment().tz('America/Lima').format());
    }

    const updatedSupport  = await this.supportRepository.save(support);

    // Invalidar el caché para ambos estados (antiguo y nuevo)
    await this.invalidateSupportCache(oldStatusId);
    if (oldStatusId !== newStatusId) {
      await this.invalidateSupportCache(newStatusId);
    }
    return updatedSupport;
  }

  
  
  async findAllRegisteredTime(
    timeFilter: 'month' | 'year' | 'custom' = 'month',
    statusId: number,
    page: number = 1,
    pageSize: number = 20,
    month?: number,
    year?: number,
    startDate?: string,
    endDate?: string
  ): Promise<{ 
    data: any[], 
    total: number, 
    page: number, 
    pageSize: number, 
    totalPages: number, 
    hasNextPage: boolean 
  }> {
    const cacheKey = `supports_${timeFilter}_${statusId}_${page}_${pageSize}_${month}_${year}_${startDate}_${endDate}`;
    
    // Intenta obtener los resultados del caché
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      // this.logger.log(`Returning cached result for ${cacheKey}`);
      return cachedResult as { 
        data: any[], 
        total: number, 
        page: number, 
        pageSize: number, 
        totalPages: number, 
        hasNextPage: boolean 
      };
    }
  
    try {
      const offset = (page - 1) * pageSize;
      let queryStartDate: string;
      let queryEndDate: string;
  
      const currentDate = moment().tz('America/Lima');
  
      switch (timeFilter) {
        case 'month':
          if (month && year) {
            queryStartDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD');
            queryEndDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
          } else {
            queryStartDate = currentDate.clone().startOf('month').format('YYYY-MM-DD');
            queryEndDate = currentDate.clone().endOf('month').format('YYYY-MM-DD');
          }
          break;
        case 'year':
          if (year) {
            queryStartDate = moment(`${year}-01-01`, 'YYYY-MM-DD').startOf('year').format('YYYY-MM-DD');
            queryEndDate = moment(`${year}-12-31`, 'YYYY-MM-DD').endOf('year').format('YYYY-MM-DD');
          } else {
            queryStartDate = currentDate.clone().startOf('year').format('YYYY-MM-DD');
            queryEndDate = currentDate.clone().endOf('year').format('YYYY-MM-DD');
          }
          break;
        case 'custom':
          if (!startDate || !endDate) {
            throw new Error('Fecha de inicio y fin son requeridas para el filtro personalizado');
          }
          // Validar y formatear las fechas de inicio y fin
          const parsedStartDate = moment(startDate, 'YYYY-MM-DD', true);
          const parsedEndDate = moment(endDate, 'YYYY-MM-DD', true);
          
          if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
          }
          
          if (parsedEndDate.isBefore(parsedStartDate)) {
            throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
          }
          
          queryStartDate = parsedStartDate.format('YYYY-MM-DD');
          queryEndDate = parsedEndDate.format('YYYY-MM-DD');
          break;
        default:
          throw new Error(`Filtro de tiempo inválido: ${timeFilter}`);
      }
  
      const query = `
        WITH filtered_supports AS (
          SELECT 
            id, created_at, user_id, status_id,
            device, brand, serial, component_a, component_b, component_c,
            accessories, image1, image2, image3, description_fail,
            solution, technical, price, estimated_price, final_price,
            deposit_amount, remaining_balance, update_status_at, delivered_at
          FROM supports
          WHERE status_id = $1
            AND created_at >= $4::date 
            AND created_at < ($5::date + interval '1 day')
        ),
        counted_supports AS (
          SELECT COUNT(*) AS full_count FROM filtered_supports
        )
        SELECT 
          fs.*,
          u.name AS user_name, 
          u.lastname AS user_lastname, 
          u.dni AS user_dni, 
          u.phone AS user_phone, 
          st.name AS status_name,
          cs.full_count
        FROM filtered_supports fs
        JOIN users u ON fs.user_id = u.id
        JOIN status st ON fs.status_id = st.id
        CROSS JOIN counted_supports cs
        ORDER BY fs.created_at DESC
        LIMIT $2 OFFSET $3
      `;
  
      const params = [statusId, pageSize, offset, queryStartDate, queryEndDate];
  
      // this.logger.debug('SQL Query:', query);
      // this.logger.debug('Query Parameters:', params);
  
      const supports = await this.dataSource.query(query, params);
      const total = supports.length > 0 ? parseInt(supports[0].full_count) : 0;
  
      const totalPages = Math.ceil(total / pageSize);
      const hasNextPage = page < totalPages;
  
      const result = {
        data: supports.map(support => {
          const { full_count, ...supportData } = support;
          return supportData;
        }),
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage
      };
  
      // Guarda el resultado en caché
      await this.cacheManager.set(cacheKey, result, 300000); // 300000 ms = 5 minutos
  
      return result;
    } catch (error) {
      this.logger.error(`Error al buscar soportes: ${error.message}`, error.stack);
      throw error;
    }
  }

  

  async updateSupportFields(id: number, updateSupportDto: UpdateSupportDto): Promise<Support> {
    try {
      let support = await this.supportRepository.findOne({ where: { id } });
      if (!support) {
        throw new NotFoundException(`Support with ID ${id} not found`);
      }

      const updatedFields = this.transformNumericFields(updateSupportDto);
      Object.assign(support, updatedFields);

      return this.saveSupportAndInvalidateCache(support);
    } catch (error) {
      this.logger.error('Error in updateSupportFields:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating support');
    }
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



  private async invalidateSupportCache(statusId: number): Promise<void> {  //! Invalida el caché para el estado especificado
    const cacheKeys = await this.cacheManager.store.keys() as string[];
    const keysToDelete = cacheKeys.filter(key => 
      key.startsWith('supports_') && key.includes(`_${statusId}_`)
    );
    
    for (const key of keysToDelete) {
      await this.cacheManager.del(key);
    }
    
    this.logger.log(`Invalidated cache for status ID: ${statusId}`);
  }



  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  
}
