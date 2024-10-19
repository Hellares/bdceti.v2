import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateComponentDto } from 'src/component/dto/create-component.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  //@HasRoles(JwtRole.ADMIN)
  //@UseGuards(JwtAuthGuard, JwtRolesGuard)
  // @Post()
  // @UseInterceptors(FileInterceptor('image'))
  // createDeviceWithImage(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
  //         new FileTypeValidator({ fileType: 'png|jpg|jpeg' }),
  //       ],
  //     })
  //   )image: Express.Multer.File,
  //   @Body() createteDeviceDto: CreateDeviceDto
  // ) {
  //   return this.deviceService.createDevice(image, createteDeviceDto);    
  // }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createDevice(
    @Body() createDeviceDto: CreateDeviceDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'png|jpg|jpeg' }),
        ],
      })
    ) image?: Express.Multer.File
  ) {
    return this.deviceService.createDevice(image, createDeviceDto);
  }                     



  @Post(':id/components')
  async assignComponentes(
    @Param('id') id: number,
    @Body() componentsDto: CreateComponentDto,
  ) {
    return this.deviceService.assignComponent(id, componentsDto);
  }

  @Get()
  async getAllDispositivos() {
    return this.deviceService.findAll();
  }

  @Get('/components/:nameDevice')
  async getComponentesByTipo(@Param('nameDevice') nameDevice: string) {
    return this.deviceService.getDevicesByName(nameDevice);
  }
}
