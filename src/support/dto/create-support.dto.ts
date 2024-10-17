import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

const transformToNumber = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    // Eliminar todos los separadores de miles (comas)
    const sanitizedValue = value.replace(/,/g, '');
    // Convertir a número
    const number = Number(sanitizedValue);
    // Verificar si es un número válido
    return isNaN(number) ? null : number;
  }
  return null; // Para cualquier otro tipo, devolver null
};

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

  @IsOptional()
  @Transform(transformToNumber)
  @IsNumber()
  estimated_price?: number;
  
  @IsOptional()
  @Transform(transformToNumber)
  @IsNumber()
  final_price?: number;

  @IsOptional()
  @Transform(transformToNumber)
  @IsNumber()
  deposit_amount?: number;

  @IsOptional()
  @Transform(transformToNumber)
  @IsNumber()
  remaining_balance?: number;

  @IsNotEmpty()
  user_id: number;

}