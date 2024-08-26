import { IsString, IsEmail, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productIds?: string[];
}

