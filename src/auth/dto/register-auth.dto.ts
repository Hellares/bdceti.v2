import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterAuthDto {
  
  @IsNotEmpty()
  @IsString()
  dni: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  //@IsEmail({},{message:'Email no valido'})
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;


  @IsNotEmpty()
  @IsString()
  //@MinLength(6,{message: 'Minimo 6 caracteres'})
  password: string;

  @IsString({each: true})
  @IsOptional()
  rolesIds?: string[];

}
