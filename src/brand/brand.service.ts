import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandService {
  private readonly logger = new Logger('BrandService');

  constructor(
    @InjectRepository(Brand) 
    private readonly brandRepository: Repository<Brand>
  ) {}

  async create(brand: CreateBrandDto): Promise<Brand> {
    try {
      const existingBrand = await this.brandRepository.findOne({ where: { name: brand.name } });
      if (existingBrand) {
        throw new HttpException('La marca ya existe', HttpStatus.BAD_REQUEST);
      }
      const newBrand = this.brandRepository.create(brand);
      return await this.brandRepository.save(newBrand);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepository.find();
  }

  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado, verifique los registros del servidor');
  }
}
