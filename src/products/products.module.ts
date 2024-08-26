import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Review } from 'src/review/entities/review.entity';
import { ProductImage } from 'src/product-image/entities/productImages.entity';
import { Supplier } from 'src/supplier/entities/suppliers.entity';
import { Category } from 'src/category/entities/category.entity';
import { FilesService } from 'src/files/files.service';

@Module({
  imports:[TypeOrmModule.forFeature([Product, Review, ProductImage, Supplier, Category])],
  controllers: [ProductsController],
  providers: [ProductsService, FilesService],
  exports: [ProductsService],
})
export class ProductsModule {}

