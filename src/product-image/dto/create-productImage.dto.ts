export class CreateProductImageDto {
  url: string;
  alt?: string;
  isMain?: boolean;
  productId: number;
}