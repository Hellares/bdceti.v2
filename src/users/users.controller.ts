import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';

@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService){}
  
  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Get()
  findAll(
    @Query() paginatioDto: PaginationDto
  ){
    return this.usersService.findAll(paginatioDto);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string){
      return this.usersService.findOne(identifier);    
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post()
  create(@Body() user: CreateUserDto ){
    return this.usersService.create(user);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() user: UpdateUserDto){ 
    return this.usersService.update(id, user);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
  @Put('notification_token/:id')
  updateNotiicationToken(
    @Param('id', ParseIntPipe) id: number, 
    @Body() user: UpdateUserDto){ 
    return this.usersService.update(id, user);
  }

  @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateUserImage(
    @UploadedFile(
      new ParseFilePipe({
        validators:[
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),// archivo de 5 megas
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ]
      })
    ) image: Express.Multer.File,
      @Param('id', ParseIntPipe) id: number,
      @Body() user: UpdateUserDto
  ){
    return this.usersService.updateUserImage(image, id, user);
    //console.log(image);
  }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id') // cambiar el estado a eliminado-- no elimna de la base de datos
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.softDelete(id);
  }
}
