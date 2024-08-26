import { Product } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ default: false })
  isMain: boolean;

  @ManyToOne(() => Product, product => product.images)
  product: Product;
}