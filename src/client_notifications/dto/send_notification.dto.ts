import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class SendNotificationDto {
  @IsNumber()
  idUser: number;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  additionalData?: { [key: string]: string };
}