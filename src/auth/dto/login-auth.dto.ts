import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class LoginAuthDto{


  @IsString()
  //@MinLength(8)
  @Transform(({value}) => value.trim())
  dni: string;


  @IsString()
  //@MinLength(6)
  password: string;
}