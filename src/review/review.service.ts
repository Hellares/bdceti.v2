import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from './entities/review.entity';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductReviewsWithAverageRating, ReviewResponse, ReviewWithTransformedUser } from './types/review.types';
import { UpdateReviewDto } from './dto/update-review.dto';


@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private productsService: ProductsService,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  private transformToReviewResponse(review: Review): ReviewResponse {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      productId: review.product.id,
      productName: review.product.name,
      userId: review.user.id,
      userName: review.user.name,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async create(createReviewDto: CreateReviewDto): Promise<ReviewResponse> {
    const { productId, userId, ...reviewData } = createReviewDto;

    // Iniciamos una transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.productsService.findOne(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }

      const user = await this.usersService.findOne2(userId);
      if (!user) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      // Verificar si el usuario ya ha hecho una review para este producto
      const existingReview = await this.reviewRepository.findOne({
        where: { user: { id: userId }, product: { id: productId } }
      });

      if (existingReview) {
        throw new ConflictException(`User has already reviewed this product`);
      }

      const review = this.reviewRepository.create({
        ...reviewData,
        product,
        user,
      });

      const savedReview = await queryRunner.manager.save(review);

      // Si todo va bien, hacemos commit de la transacción
      await queryRunner.commitTransaction();

      // Transformamos la review guardada al tipo ReviewResponse
      return this.transformToReviewResponse(savedReview);

    } catch (error) {
      // Si algo sale mal, hacemos rollback de la transacción
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }

      // Log del error y lanzar una excepción genérica
      console.error('Error creating review:', error);
      throw new InternalServerErrorException('An error occurred while creating the review');

    } finally {
      // Liberamos el queryRunner
      await queryRunner.release();
    }
  }

  //! obtner todos los reviews de un producto y calcular su promedio de rating -- "native consult query sql"
  async findProductReviewsWithAverageRatingNative(productId: string): Promise<ProductReviewsWithAverageRating> {
    const query = `
      SELECT 
        r.id, r.rating, r.comment, r."createdAt" as "createdAt",
        p.id as "productId", p.name as "productName",
        u.id as "userId", u.name as "userName",
        AVG(r.rating) OVER () as "averageRating"
      FROM 
        reviews r
      JOIN 
        products p ON r."productId" = p.id
      JOIN 
        users u ON r."userId" = u.id
      WHERE 
        p.id = $1
      ORDER BY 
        r."createdAt" DESC
    `;

    const results: (ReviewWithTransformedUser & { averageRating: string })[] = await this.reviewRepository.query(query, [productId]);

    if (results.length === 0) {
      throw new NotFoundException(`No reviews found for product ID "${productId}"`);
    }

    const averageRating = Number(Number(results[0].averageRating).toFixed(2));
    const reviews = results.map(({ averageRating, ...rest }) => rest);

    return {
      reviews,
      averageRating
    };
  }

  async updateReview(
    reviewId: number,
    userId: number,
    updateReviewDto: UpdateReviewDto
  ): Promise<ReviewResponse> {
    // Verificar que al menos un campo para actualizar está presente
    if (updateReviewDto.rating === undefined && updateReviewDto.comment === undefined) {
      throw new BadRequestException('At least one field (rating or comment) must be provided for update');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = await this.reviewRepository.findOne({
        where: { id: reviewId },
        relations: ['user', 'product']
      });

      if (!review) {
        throw new NotFoundException(`Review with ID "${reviewId}" not found`);
      }

      if (review.user.id !== userId) {
        throw new ForbiddenException('You can only update your own reviews');
      }

      // Actualizar solo los campos proporcionados
      let isUpdated = false;

      if (updateReviewDto.rating !== undefined) {
        review.rating = updateReviewDto.rating;
        isUpdated = true;
      }
      
      if (updateReviewDto.comment !== undefined) {
        review.comment = updateReviewDto.comment;
        isUpdated = true;
      }

      if (isUpdated) {
        review.updatedAt = new Date(); // Actualizar la fecha de modificación
        const updatedReview = await queryRunner.manager.save(review);
        await queryRunner.commitTransaction();
        return this.transformToReviewResponse(updatedReview);
      } else {
        // Si no se actualizó nada (aunque esto no debería ocurrir debido a la verificación inicial)
        await queryRunner.rollbackTransaction();
        return this.transformToReviewResponse(review);
      }

    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error updating review:', error);
      throw new InternalServerErrorException('An error occurred while updating the review');

    } finally {
      await queryRunner.release();
    }
  }

}

  



