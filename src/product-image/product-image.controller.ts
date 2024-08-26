import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-productImage.dto';
import { UpdateProductImageDto } from './dto/update-productImage.dto';

@Controller('product-image')
export class ProductImageController {

  constructor(private productImageService: ProductImageService) {}

  @Post()
  create(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImageService.create(createProductImageDto);
  }

  @Get()
  findAll() {
    return this.productImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productImageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productImageService.update(+id, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImageService.remove(+id);
  }
}
