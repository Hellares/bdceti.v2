import { Module } from '@nestjs/common';
import { UserHasRolesService } from './user_has_roles.service';
import { UserHasRolesController } from './user_has_roles.controller';

@Module({
  providers: [UserHasRolesService],
  controllers: [UserHasRolesController]
})
export class UserHasRolesModule {}
