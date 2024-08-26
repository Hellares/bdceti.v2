import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/productImages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage])],
  providers: [ProductImageService],
  controllers: [ProductImageController]
})
export class ProductImageModule {}
