import { Controller, Get } from '@nestjs/common';
import { UserHasRolesService } from './user_has_roles.service';

@Controller('user-roles')
export class UserHasRolesController {
  constructor(private userHasRolesService: UserHasRolesService) {}

  @Get('count')
  async getCounterUserByRole(){
    return this.userHasRolesService.counterUserByRole();
  }
}
