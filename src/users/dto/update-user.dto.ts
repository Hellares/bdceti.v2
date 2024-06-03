import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto{

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  lastname?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  isActive?:boolean;

  @IsString()
  @IsOptional()
  notification_token?: string
  
}