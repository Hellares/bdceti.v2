import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from './entities/productImages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductImageDto } from './dto/create-productImage.dto';
import { UpdateProductImageDto } from './dto/update-productImage.dto';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductImageDto: CreateProductImageDto): Promise<ProductImage> {
    const productImage = this.productImageRepository.create(createProductImageDto);
    return await this.productImageRepository.save(productImage);
  }

  async findAll(): Promise<ProductImage[]> {
    return await this.productImageRepository.find();
  }

  async findOne(id: number): Promise<ProductImage> {
    const productImage = await this.productImageRepository.findOne({ where: { id } });
    if (!productImage) {
      throw new NotFoundException(`Product image with ID ${id} not found`);
    }
    return productImage;
  }

  async update(id: number, updateProductImageDto: UpdateProductImageDto): Promise<ProductImage> {
    const productImage = await this.findOne(id);
    Object.assign(productImage, updateProductImageDto);
    return await this.productImageRepository.save(productImage);
  }

  async remove(id: number): Promise<void> {
    const productImage = await this.findOne(id);
    await this.productImageRepository.remove(productImage);
  }
}
