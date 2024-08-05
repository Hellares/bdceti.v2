import { Body, Controller, FileTypeValidator, Get, InternalServerErrorException, Logger, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { SupportService } from './support.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateSupportDto } from './dto/create-support.dto';
import { Support } from './entities/support.entity';
import { CustomDatabaseException } from 'src/utils/custom_database_exception';

@Controller('support')
export class SupportController {
  private readonly logger = new Logger(SupportController.name);
  constructor(private supportService: SupportService){}
  
  @Post()
  @UseInterceptors(FilesInterceptor('files[]', 3))
  async create(
    @UploadedFiles(
      new ParseFilePipe({
        validators:[
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),// archivo de 5 megas
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )files: Array<Express.Multer.File>,
    @Body()support: CreateSupportDto
    
  ){    
    return this.supportService.createSupport(files, support);    
  }

  @Get('user/:userId')
  async findByIdClient(@Param('userId', ParseIntPipe) userId: number): Promise<Support[]> {
    try {
      const supports = await this.supportService.findByIdClient(userId);
      return supports;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error al buscar los soportes del cliente');
    }
  }

  // @Get('user/dni/:dni')
  // async findByUserDni(@Param('dni') dni: string): Promise<Support[]> {
  //   try {
  //     const supports = await this.supportService.findByUserDni(dni);
  //     return supports;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new NotFoundException('Error al buscar los soportes del cliente por DNI');
  //   }
  // }
  @Get()
  async findByUserIdOrDni(
    @Query('id') id: string,
    @Query('dni') dni: string,
  ): Promise<Support[]> {
    if (!id && !dni) {
      throw new NotFoundException('Debe proporcionar al menos un ID de usuario o un DNI.');
    }
    const userId = id ? parseInt(id, 10) : null;
    const supports = await this.supportService.findByUserIdOrDni(userId, dni);
    return supports;
  }



  @Get('status/:statusId')
  async findByIdStatus(@Param('statusId', ParseIntPipe) statusId: number): Promise<Support[]> {
    try {
      const supports = await this.supportService.findByIdStatus(statusId);
      return supports;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error al buscar los soportes');
    }
  }
}
