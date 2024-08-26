import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource, QueryRunner } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { Supplier } from 'src/supplier/entities/suppliers.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from 'src/files/files.service';
import { ProductImage } from 'src/product-image/entities/productImages.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly fileService: FilesService,
    private dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryIds, supplierIds, ...productData } = createProductDto;

    const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
    const suppliers = await this.supplierRepository.findBy({id: In(supplierIds)});

    const product = this.productRepository.create({
      ...productData,
      categories,
      suppliers
    });
    return this.productRepository.save(product);
  }

  //! CREATE PRODUCT WITH IMAGES (MULTIPLE IMAGES) ONE METHOD
  async createWithImagesV1(createProductDto: CreateProductDto, imageFiles: Express.Multer.File[]): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { categoryIds, supplierIds, ...productData } = createProductDto;

      
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      const suppliers = await this.supplierRepository.findBy({ id: In(supplierIds) });
      const product = this.productRepository.create({
        ...productData,
        categories,
        suppliers,
      });

      const savedProduct = await queryRunner.manager.save(product);

      if (imageFiles && imageFiles.length > 0) {
        const productImages: ProductImage[] = [];

        for (const file of imageFiles) {
          const imageUrl = await this.fileService.uploadImage(file);
          const productImage = this.productImageRepository.create({
            url: imageUrl.secure_url,
            product: savedProduct,
          });
          productImages.push(productImage);
        }

        await queryRunner.manager.save(ProductImage, productImages);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create product: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // private async createProductWithAssociations(createProductDto: CreateProductDto, queryRunner?: QueryRunner): Promise<Product> {
  //   const { categoryIds, supplierIds, ...productData } = createProductDto;
  
  //   const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
  //   const suppliers = await this.supplierRepository.findBy({ id: In(supplierIds) });
  
  //   if (categories.length !== categoryIds.length || suppliers.length !== supplierIds.length) {
  //     throw new BadRequestException('One or more category or supplier IDs are invalid');
  //   }
  
  //   const product = this.productRepository.create({
  //     ...productData,
  //     categories,
  //     suppliers,
  //   });
  
  //   return queryRunner ? queryRunner.manager.save(product) : this.productRepository.save(product);
  // }
  
  // async create(createProductDto: CreateProductDto): Promise<Product> {
  //   try {
  //     return await this.createProductWithAssociations(createProductDto);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to create product: ' + error.message);
  //   }
  // }
  
  // async createWithImagesV2(createProductDto: CreateProductDto, imageFiles: Express.Multer.File[]): Promise<Product> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  
  //   try {
  //     const savedProduct = await this.createProductWithAssociations(createProductDto, queryRunner);
  
  //     if (imageFiles && imageFiles.length > 0) {
  //       const MAX_IMAGES = 10; // Example limit
  //       if (imageFiles.length > MAX_IMAGES) {
  //         throw new BadRequestException(`Cannot upload more than ${MAX_IMAGES} images`);
  //       }
  
  //       const productImages: ProductImage[] = await Promise.all(imageFiles.map(async (file) => {
  //         const imageUrl = await this.fileService.uploadImage(file);
  //         return this.productImageRepository.create({
  //           url: imageUrl.secure_url,
  //           product: savedProduct,
  //         });
  //       }));
  
  //       await queryRunner.manager.save(ProductImage, productImages);
  //     }
  
  //     await queryRunner.commitTransaction();
  
  //     return this.findOne(savedProduct.id);
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw new BadRequestException('Failed to create product: ' + error.message);
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }


  async findAll(options: IPaginationOptions): Promise<Pagination<Product>> {
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;
    const skippedItems = (page - 1) * limit;

    const query = `
      SELECT p.*, 
             array_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) as categories,
             array_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) as suppliers,
             array_agg(DISTINCT jsonb_build_object('id', i.id, 'url', i.url)) as images
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc."productsId"
      LEFT JOIN categories c ON pc."categoriesId" = c.id
      LEFT JOIN product_suppliers ps ON p.id = ps."productsId"
      LEFT JOIN suppliers s ON ps."suppliersId" = s.id
      LEFT JOIN product_images i ON p.id = i."productId"
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `SELECT COUNT(DISTINCT p.id) FROM products p`;

    const [products, totalItems] = await Promise.all([
      this.productRepository.query(query, [limit, skippedItems]),
      this.productRepository.query(countQuery).then(result => parseInt(result[0].count, 10))
    ]);

    const transformedProducts = products.map(this.transformProduct);

    return {
      items: transformedProducts,
      meta: {
        totalItems,
        itemCount: transformedProducts.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
      }
    };
  }
  private transformProduct(product: any): Product {
    return {
      ...product,
      // price: parseFloat(product.price),
      // discountPrice: parseFloat(product.discountPrice),
      // weight: parseFloat(product.weight),
      // averageRating: parseFloat(product.averageRating),
      categories: product.categories.filter(c => c.id),
      suppliers: product.suppliers.filter(s => s.id),
      images: product.images.filter(i => i.id),
      reviews: product.reviews ? product.reviews.filter(r => r.id) : []
    };
  }

  async findAll1(options: IPaginationOptions): Promise<Pagination<Product>> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.suppliers', 'supplier')
      .leftJoinAndSelect('product.images', 'image');

    return paginate<Product>(queryBuilder, options);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'suppliers', 'images', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  // async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
  //   const { categoryIds, supplierIds, ...updateData } = updateProductDto;

  //   const product = await this.findOne(id);

  //   if (categoryIds) {
  //     const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
  //     product.categories = categories;
  //   }

  //   if (supplierIds) {
  //     const suppliers = await this.supplierRepository.findBy({ id: In(supplierIds) });
  //     product.suppliers = suppliers;
  //   }

  //   Object.assign(product, updateData);

  //   return this.productRepository.save(product);
  // }

  async search(params: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
    isOnSale?: boolean;
    inStock?: boolean;
    options: IPaginationOptions;
  }): Promise<Pagination<Product>> {
    const { query, minPrice, maxPrice, categoryId, isOnSale, inStock, options } = params;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.suppliers', 'supplier')
      .leftJoinAndSelect('product.images', 'image');

    if (query) {
      queryBuilder.andWhere('(product.name ILIKE :query OR product.description ILIKE :query)', { query: `%${query}%` });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (isOnSale !== undefined) {
      queryBuilder.andWhere('product.isOnSale = :isOnSale', { isOnSale });
    }

    if (inStock !== undefined) {
      queryBuilder.andWhere('product.stock > 0');
    }

    return paginate<Product>(queryBuilder, options);
  }

  // async updateStock(id: string, quantity: number): Promise<Product> {
  //   const product = await this.findOne(id);
  //   if (product.stock + quantity < 0) {
  //     throw new BadRequestException('Insufficient stock');
  //   }
  //   product.stock += quantity;
  //   return this.productRepository.save(product);
  // }

  // async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  //   return this.productRepository.find({
  //     where: { isFeatured: true },
  //     take: limit,
  //     relations: ['images'],
  //   });
  // }

  // async getRelatedProducts(productId: string, limit: number = 10): Promise<Product[]> {
  //   const product = await this.findOne(productId);
  //   const categoryIds = product.categories.map(cat => cat.id);

  //   return this.productRepository
  //     .createQueryBuilder('product')
  //     .innerJoin('product.categories', 'category')
  //     .where('category.id IN (:...categoryIds)', { categoryIds })
  //     .andWhere('product.id != :productId', { productId })
  //     .take(limit)
  //     .getMany();
  // }

  
}
