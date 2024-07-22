import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateComponentDto {

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  name: string;

}