import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsDate, IsInt, Min, ArrayMinSize, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;


  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOnSale?: boolean;



  @IsInt()
  @Min(0)
  @Type(() => Number)
  // @Transform(({ value }) => {
  //   const parsedValue = parseInt(value);
  //   return isNaN(parsedValue) ? value : parsedValue;
  // })
  stock: number;
  

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @Transform(({ value }) => transformToStringArray(value))
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsOptional()
  attributes?: Record<string, any>;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  weight?: number;
  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number) 
  viewCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number) 
  salesCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)   
  likesCount?: number;


  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  @Type(() => Number)
  averageRating?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableTo?: Date;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  slug?: string;


//! METODO FUNCIONAL PARA AGREGAR EL ARRAY DE CATEGORIAS

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Transform(({ value }) => transformToNumberArray(value))
  // @Type(() => Number)
  categoryIds: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Transform(({ value }) => transformToNumberArray(value))
  // @Type(() => Number)
  supplierIds: number[];
}

//! FUNCION PARA TRANSFORMAR EL ARRAY DE CATEGORIAS (tipo number)
function transformToNumberArray(value: any): number[] {
  if (typeof value === 'string') return value.split(',').map(Number);
  if (Array.isArray(value)) return value.map(Number);
  return [Number(value)];
}

//! FUNCION PARA TRANSFORMAR EL ARRAY  (tipo string)
function transformToStringArray(value: any): string[] {
  if (typeof value === 'string') return value.split(',').map(s => s.trim());
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

