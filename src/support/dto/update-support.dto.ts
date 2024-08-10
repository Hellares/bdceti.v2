import { isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateSupportDto{


  @IsNotEmpty()
  id?: number;
  
  @IsString()
  @IsOptional()
  device?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  serial?: string;

  @IsString()
  @IsOptional()
  componentA?: string;

  @IsString()
  @IsOptional()
  componentB?: string;

  @IsString()
  @IsOptional()
  componentC?: string;

  @IsString()
  @IsOptional()
  accessories?: string;

  @IsString()
  @IsOptional()
  image1?: string;

  @IsString()
  @IsOptional()
  image2?: string;

  @IsString()
  @IsOptional()
  image3?: string;

  @IsString()
  @IsOptional()
  descriptionFail?: string;

  @IsString()
  @IsOptional()
  solution?: string;


  @IsOptional()
  status_id?: number;


  @IsString()
  @IsOptional()
  technical?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}