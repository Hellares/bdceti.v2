import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponse } from './types/review.types';


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  //!todo: dar permiso a un usuario para crear una review
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get('product/:productId')
  async getProductReviewsWithAverageRatingNative(
    @Param('productId') productId: string
  ) {
    return this.reviewService.findProductReviewsWithAverageRatingNative(productId);
  }

  //!todo: dar permiso a un usuario para actualizar su propia review
  @Patch(':id/user/:userId')
  async updateReview(
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Param('userId') userId: number,
    ): Promise<ReviewResponse> {
    return this.reviewService.updateReview(id, userId, updateReviewDto);
  }
}


