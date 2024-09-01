import { Body, Controller, DefaultValuePipe, Get, NotFoundException, Param, ParseBoolPipe, ParseIntPipe, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],){

    return this.productsService.createWithImagesV1(createProductDto, images);
  }

  // @Post()
  // async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
  //   try {
  //     return await this.productsService.create(createProductDto);
  //   } catch (error) {
  //     throw new BadRequestException(`Failed to create product: ${error.message}`);
  //   }
  // }

  // @Post('/with-images')
  // @UseInterceptors(FilesInterceptor('images', 10)) // Limita a 10 imágenes
  // async createWithImages(
  //   @Body() createProductDto: CreateProductDto,
  //   @UploadedFiles() files: Express.Multer.File[]
  // ): Promise<Product> {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('No image files uploaded');
  //   }

  //   try {
  //     return await this.productsService.createWithImagesV2(createProductDto, files);
  //   } catch (error) {
  //     throw new BadRequestException(`Failed to create product with images: ${error.message}`);
  //   }
  // }



  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<Pagination<Product>> {
    limit = limit > 100 ? 100 : limit;
    return this.productsService.findAll({
      page,
      limit,
    });
  }


  //! BUSQUEDA PRODUCTOS AVANZADAS (SEGUN PARAMETROS)
  @Get('search')
  search(
    @Query('query') query?: string,
    @Query('minPrice', new DefaultValuePipe(0), ParseIntPipe) minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(Number.MAX_SAFE_INTEGER), ParseIntPipe) maxPrice?: number,
    @Query('categoryId') categoryId?: string,
    @Query('isOnSale') isOnSale?: boolean,
    @Query('inStock') inStock?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.productsService.search({
      query,
      minPrice,
      maxPrice,
      categoryId,
      isOnSale,
      inStock,
      options: {
        page,
        limit
      },
    });
  }
}
