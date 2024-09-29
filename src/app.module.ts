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
import { ClientNotificationsModule } from './client_notifications/client_notifications.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UserHasRolesModule } from './user_has_roles/user_has_roles.module';
import { ProductsModule } from './products/products.module';
import { SupplierModule } from './supplier/supplier.module';
import { CategoryModule } from './category/category.module';
import { ProductImageModule } from './product-image/product-image.module';
import { ReviewModule } from './review/review.module';
import { BrandModule } from './brand/brand.module';



@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),

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
    UsersModule, AuthModule, FilesModule, CommonModule, RolesModule, SunatModule, DeviceModule, ComponentModule, SupportModule, StatusModule,FirebaseModule, ClientNotificationsModule, UserHasRolesModule, ProductsModule, SupplierModule, CategoryModule, ProductImageModule, ReviewModule, BrandModule
  ],
  controllers: [ComponentController],
  providers: [ComponentService],
})
export class AppModule {}
