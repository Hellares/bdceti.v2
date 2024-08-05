import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { FilesService } from 'src/files/files.service';
import { Rol } from 'src/roles/entities/rol.entity';
import { Support } from 'src/support/entities/support.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([ User, Rol, Support ])],
  controllers: [UsersController],
  providers: [UsersService, FilesService, JwtStrategy]
})
export class UsersModule {}
