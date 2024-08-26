import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Min, Max, IsString, IsUUID, IsIn } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}