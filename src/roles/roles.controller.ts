import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateRolDto } from './entities/dto/create-rol.dto';
import { RolesService } from './roles.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { JwtRole } from 'src/auth/jwt/jwt-role';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService){}

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Post()
  create(
    @Body()rol: CreateRolDto
  ){
    return this.rolesService.create(rol);
  }
}
