import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class LoginAuthDto{


  @IsString()
  //@MinLength(8)
  dni: string;


  @IsString()
  //@MinLength(6)
  password: string;
}