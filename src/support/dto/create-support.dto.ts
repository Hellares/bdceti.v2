import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSupportDto{  

  @IsString()
  @IsOptional()
  device: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  serial: string;

  @IsString()
  @IsOptional()
  componentA: string;

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
  descriptionFail?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsString()
  @IsOptional()
  technical?: string;

  //@IsString()
  @IsOptional()
  price?: number;

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  estimatedPrice?: number; //precio estimado

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  finalPrice?: number;  // precio final

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  depositAmount?: number; // monto depositado a cuenta

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  remainingBalance?: number; // saldo pendiente

  @IsNotEmpty()
  user_id: number;

}