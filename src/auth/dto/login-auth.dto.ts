import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class LoginAuthDto{


  @IsString()
  @MinLength(8,{message:'Minimo 8 caracteres'})
  dni: string;


  @IsString()
  @MinLength(6,{message:'Minimo 6 caracteres'})
  password: string;
}