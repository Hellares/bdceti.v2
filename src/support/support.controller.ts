import { BadRequestException, Body, Controller, DefaultValuePipe, FileTypeValidator, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SupportService } from './support.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateSupportDto } from './dto/create-support.dto';
import { Support } from './entities/support.entity';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { UpdateSupportDto } from './dto/update-support.dto';

type TimeFilter = 'week' | 'month' | 'year';

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

  // @Get('registered')
  // async getRegisteredSupports(
  //   @Query('timeFilter') timeFilter: 'week' | 'month' | 'year' = 'week',
  //   @Query('month') monthString?: string,
  //   @Query('year') yearString?: string
  // ) {
  //   let month: number | undefined;
  //   let year: number | undefined;

  //   if (timeFilter === 'month' || timeFilter === 'year') {
  //     if (timeFilter === 'month' && monthString) {
  //       month = parseInt(monthString, 10);
  //       if (isNaN(month) || month < 1 || month > 12) {
  //         throw new BadRequestException('El mes debe ser un número entre 1 y 12');
  //       }
  //     }

  //     if (yearString) {
  //       year = parseInt(yearString, 10);
  //       if (isNaN(year)) {
  //         throw new BadRequestException('El año debe ser un número válido');
  //       }
  //     }

  //     if (timeFilter === 'month' && (!month || !year)) {
  //       throw new BadRequestException('Mes y año son requeridos para el filtro mensual');
  //     }

  //     if (timeFilter === 'year' && !year) {
  //       throw new BadRequestException('Año es requerido para el filtro anual');
  //     }
  //   }

  //   return this.supportService.findAllRegisteredTime(timeFilter, month, year);
  // }
//   @Get('registered')
// async getSupports(
//   @Query('timeFilter') timeFilter: 'week' | 'month' | 'year' = 'week',
//   @Query('statusId') statusIdString: string,
//   @Query('month') monthString?: string,
//   @Query('year') yearString?: string
// ) {
//   let month: number | undefined;
//   let year: number | undefined;
//   let statusId: number;

//   // Validar y convertir statusId
//   statusId = parseInt(statusIdString, 10);
//   if (isNaN(statusId) || ![1, 2, 3].includes(statusId)) {
//     throw new BadRequestException('statusId debe ser 1, 2 o 3');
//   }

//   if (timeFilter === 'month' || timeFilter === 'year') {
//     if (timeFilter === 'month' && monthString) {
//       month = parseInt(monthString, 10);
//       if (isNaN(month) || month < 1 || month > 12) {
//         throw new BadRequestException('El mes debe ser un número entre 1 y 12');
//       }
//     }

//     if (yearString) {
//       year = parseInt(yearString, 10);
//       if (isNaN(year)) {
//         throw new BadRequestException('El año debe ser un número válido');
//       }
//     }

//     if (timeFilter === 'month' && (!month || !year)) {
//       throw new BadRequestException('Mes y año son requeridos para el filtro mensual');
//     }

//     if (timeFilter === 'year' && !year) {
//       throw new BadRequestException('Año es requerido para el filtro anual');
//     }
//   }

//   return this.supportService.findAllRegisteredTime(timeFilter, statusId, month, year);
// }
// @Get('registered')
//   async getSupports(
//     @Query('timeFilter') timeFilter: 'week' | 'month' | 'year',
//     @Query('statusId') statusId: number,
//     @Query('page') page: number = 1,
//     @Query('pageSize') pageSize: number = 20,
//     @Query('month') month?: number,
//     @Query('year') year?: number
//   ) {
//     this.logger.log(`Received request with params: ${JSON.stringify({ timeFilter, statusId, page, pageSize, month, year })}`);

//     try {
//       const result = await this.supportService.findAllRegisteredTime(
//         timeFilter,
//         statusId,
//         page,
//         pageSize,
//         month,
//         year
//       );

//       if (result.total === 0) {
//         const statusName = this.getStatusName(statusId);
//         const periodDescription = this.getPeriodDescription(timeFilter, month, year);
//         return {
//           message: `No se encontraron soportes ${statusName} para ${periodDescription}`,
//           data: [],
//           total: 0,
//           page,
//           pageSize
//         };
//       }

//       this.logger.log(`Successfully retrieved ${result.data.length} supports`);
//       return {
//         message: `Se encontraron ${result.total} soportes`,
//         ...result
//       };
//     } catch (error) {
//       this.logger.error(`Error in getSupports: ${error.message}`, error.stack);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new BadRequestException('Error al buscar soportes. Por favor, inténtelo de nuevo más tarde.');
//     }
//   }

//   private getStatusName(statusId: number): string {
//     switch (statusId) {
//       case 1: return 'registrados';
//       case 2: return 'en reparación';
//       case 3: return 'reparados';
//       case 4: return 'entregados';
//       default: return 'con el estado especificado';
//     }
//   }

//   private getPeriodDescription(timeFilter: 'week' | 'month' | 'year', month?: number, year?: number): string {
//     switch (timeFilter) {
//       case 'week': return 'la semana actual';
//       case 'month': return `el mes ${month}/${year}`;
//       case 'year': return `el año ${year}`;
//       default: return 'el período especificado';
//     }
//   }

@Get('registered')
async getSupports(
  @Query('timeFilter') timeFilter: 'month' | 'year' | 'custom',
  @Query('statusId', ParseIntPipe) statusId: number,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  @Query('month') month?: string,
  @Query('year') year?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  this.logger.log(`Received request with params: ${JSON.stringify({ 
    timeFilter, statusId, page, pageSize, month, year, startDate, endDate 
  })}`);

  try {
    // Convertir month y year a número si están presentes
    const parsedMonth = month ? parseInt(month, 10) : undefined;
    const parsedYear = year ? parseInt(year, 10) : undefined;

    // Validar que month y year sean números válidos si están presentes
    if ((month && isNaN(parsedMonth)) || (year && isNaN(parsedYear))) {
      throw new BadRequestException('Month and year must be valid numbers');
    }

    const result = await this.supportService.findAllRegisteredTime(
      timeFilter,
      statusId,
      page,
      pageSize,
      parsedMonth,
      parsedYear,
      startDate,
      endDate
    );

    if (result.total === 0) {
      const statusName = this.getStatusName(statusId);
      const periodDescription = this.getPeriodDescription(timeFilter, parsedMonth, parsedYear, startDate, endDate);
      return {
        message: `No se encontraron soportes ${statusName} para ${periodDescription}`,
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNextPage: false
      };
    }

    this.logger.log(`Successfully retrieved ${result.data.length} supports`);
    return {
      message: `Se encontraron ${result.total} soportes`,
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage
    };
  } catch (error) {
    this.logger.error(`Error in getSupports: ${error.message}`, error.stack);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Error al buscar soportes. Por favor, inténtelo de nuevo más tarde.');
  }
}

private getStatusName(statusId: number): string {
  const statusNames = {
    1: 'REGISTRADO',
    // Añade más estados según sea necesario
  };
  return statusNames[statusId] || 'desconocido';
}

private getPeriodDescription(
  timeFilter: 'month' | 'year' | 'custom',
  month?: number,
  year?: number,
  startDate?: string,
  endDate?: string
): string {
  switch (timeFilter) {
    case 'month':
      return month && year ? `el mes ${month}/${year}` : 'el mes actual';
    case 'year':
      return year ? `el año ${year}` : 'el año actual';
    case 'custom':
      return `el período del ${startDate} al ${endDate}`;
    default:
      return 'el período especificado';
  }
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
