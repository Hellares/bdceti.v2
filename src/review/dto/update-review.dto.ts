import { IsInt, Min, Max, IsString, IsOptional, ValidateIf } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.comment !== '')
  comment?: string;
}