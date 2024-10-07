import { BadRequestException, Body, Controller, FileTypeValidator, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SupportService } from './support.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateSupportDto } from './dto/create-support.dto';
import { Support } from './entities/support.entity';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { UpdateSupportDto } from './dto/update-support.dto';

@Controller('support')
export class SupportController {
  private readonly logger = new Logger(SupportController.name);
  constructor(private supportService: SupportService){}
  
  // @Post() // crear soporte con images al menos una
  // @UseInterceptors(FilesInterceptor('files[]', 3))
  // async create(
  //   @UploadedFiles(
  //     new ParseFilePipe({
  //       validators:[
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),// archivo de 5 megas
  //         new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
  //       ],
  //     }),
  //   )files: Array<Express.Multer.File>,
  //   @Body()support: CreateSupportDto
    
  // ){    
  //   return this.supportService.createSupport(files, support);    
  // }
  @Post() //! crear soporte con o sin imagenes
  @UseInterceptors(FilesInterceptor('files[]',3))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createSupportDto: CreateSupportDto
  ) {
    return this.supportService.createSupport(files, createSupportDto);
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



  @Get('status/:statusId') // buscar por estado
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

  @Post('update-status')
  async updateStatus(
    @Body() update: UpdateSupportDto,
  ): Promise<{ message: string }> {
    try {
      await this.supportService.updateStatus(update);
      return { message: 'Status updated successfully' };
    } catch (error) {
      console.error('Error updating status:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('registered')
  async getRegisteredSupports(
    @Query('timeFilter') timeFilter: 'week' | 'month' | 'year' = 'week',
    @Query('month') monthString?: string,
    @Query('year') yearString?: string
  ) {
    let month: number | undefined;
    let year: number | undefined;

    if (timeFilter === 'month' || timeFilter === 'year') {
      if (timeFilter === 'month' && monthString) {
        month = parseInt(monthString, 10);
        if (isNaN(month) || month < 1 || month > 12) {
          throw new BadRequestException('El mes debe ser un número entre 1 y 12');
        }
      }

      if (yearString) {
        year = parseInt(yearString, 10);
        if (isNaN(year)) {
          throw new BadRequestException('El año debe ser un número válido');
        }
      }

      if (timeFilter === 'month' && (!month || !year)) {
        throw new BadRequestException('Mes y año son requeridos para el filtro mensual');
      }

      if (timeFilter === 'year' && !year) {
        throw new BadRequestException('Año es requerido para el filtro anual');
      }
    }

    return this.supportService.findAllRegisteredTime(timeFilter, month, year);
  }

  @Get('stats')
  async getSupportStats() {
    try {
      const stats = await this.supportService.getSupportsByStatusCount();
      return {
        success: true,
        data: {
          totalRegistros: parseInt(stats.total_registros),
          totalRegistrado: parseInt(stats.total_registrado),
          totalReparando: parseInt(stats.total_reparando),
          totalReparado: parseInt(stats.total_reparado),
          totalEntregado: parseInt(stats.total_entregado),
          precioPromedio: parseFloat(stats.precio_promedio),
          totalMarcas: parseInt(stats.total_marcas),
          totalDispositivos: parseInt(stats.total_dispositivos)
        },
        message: 'Estadísticas de soporte obtenidas exitosamente'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Error al obtener las estadísticas de soporte',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
