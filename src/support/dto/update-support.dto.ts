import { isNotEmpty, IsNotEmpty, IsString } from "class-validator";

export class UpdateSupportDto{


  

  device?: string;


  brand?: string;


  serial?: string;


  componentA?: string;


  componentB?: string;


  componentC?: string;


  accessories?: string;


  image1?: string;


  image2?: string;


  image3?: string;


  descriptionFail?: string;


  solution?: string;


  // idStatus?: number;


  technical?: string;

  price?: number;
}