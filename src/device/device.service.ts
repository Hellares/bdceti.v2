import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { Component } from 'src/component/entities/component.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateComponentDto } from 'src/component/dto/create-component.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class DeviceService {
  private logger = new Logger();
  constructor(
    @InjectRepository(Device) private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Component) private readonly componentRepository: Repository<Component>,
    private readonly filesService: FilesService
  ) {}

  async createDevice(file: Express.Multer.File | undefined, createDeviceDto: CreateDeviceDto) {
    try {
      let secure_url: string | undefined;
  
      if (file) {
        const uploadResult = await this.filesService.uploadImage(file);
        secure_url = uploadResult.secure_url;
      }
  
      // Si hay una imagen, la añadimos al DTO. Si no, la propiedad image quedará undefined.
      if (secure_url) {
        createDeviceDto.image = secure_url;
      }
  
      let newDevice = this.deviceRepository.create(createDeviceDto);
      await this.deviceRepository.save(newDevice);
      return newDevice;
    } catch (error) {
      this.handleDBExceptions(error);
    }    
  }

  async assignComponent(deviceId: number, componentDto:CreateComponentDto) {
    const device = await this.deviceRepository.findOne({
      where: {id: deviceId},
      relations: ['components']
    });
    if(!device){
      throw new HttpException('No existe el dispositivo', HttpStatus.NOT_FOUND);
    }

    const components = await this.componentRepository.save(componentDto);

    device.components.push(components);
    return this.deviceRepository.save(device);
  }  
  async findAll(){
    return this.deviceRepository.find({relations: ['components']});
  }
  async getDevicesByName(nameDevice: string) {
    return this.deviceRepository.findOne({
      where: {name: nameDevice},
      relations: ['components']
    });
  }

  private handleDBExceptions( error: any ){    
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
