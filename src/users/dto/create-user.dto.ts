import { IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  
  @IsString()
  dni: string;

  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  notification_token?: string;
}
