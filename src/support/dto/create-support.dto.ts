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
  component_a: string;

  @IsString()
  @IsOptional()
  component_b?: string;

  @IsString()
  @IsOptional()
  component_c?: string;

  @IsString()
  @IsOptional()
  accessories?: string;

  @IsString()
  @IsOptional()
  description_fail?: string;

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
  estimated_price?: number; //precio estimado

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  final_price?: number;  // precio final

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  deposit_amount?: number; // monto depositado a cuenta

  @Transform(({ value }) => value ? parseFloat(value.replace(/,/g, '')) : value)
  @IsOptional()
  remaining_balance?: number; // saldo pendiente

  @IsNotEmpty()
  user_id: number;

}