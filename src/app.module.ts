import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { CommonModule } from './common/common.module';
import { RolesModule } from './roles/roles.module';
import { SunatModule } from './sunat/sunat.module';
import { DeviceModule } from './device/device.module';
import { ComponentController } from './component/component.controller';
import { ComponentService } from './component/component.service';
import { ComponentModule } from './component/component.module';
import { SupportModule } from './support/support.module';
import { StatusModule } from './status/status.module';
@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule, AuthModule, FilesModule, CommonModule, RolesModule, SunatModule, DeviceModule, ComponentModule, SupportModule, StatusModule
  ],
  controllers: [ComponentController],
  providers: [ComponentService],
})
export class AppModule {}
