
import { Transform } from "class-transformer";
import { isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

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

export class UpdateSupportDto{


  @IsNotEmpty()
  id?: number;

  @IsOptional()
  status_id?: number;

  @IsString()
  @IsOptional()
  technical?: string;

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
  @IsString()
  description_output?: string;


  
}