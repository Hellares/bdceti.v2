import { Category } from "src/category/entities/category.entity";
import { ProductImage } from "src/product-image/entities/productImages.entity";
import { Review } from "src/review/entities/review.entity";
import { Supplier } from "src/supplier/entities/suppliers.entity";
import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Delete } from '@nestjs/common';

@Entity('products')
@Index(['name','sku'])
export class Product{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({unique: true})
  @Index()
  sku: string;

  @Column('text')
  description: string;

  @Column('text', {nullable: true})
  shortDescription: string;

  @Column('decimal', {precision: 10, scale: 2, default: 0})
  price: number;

  @Column('decimal', {precision: 10, scale: 2, default: 0})
  discountPrice: number;

  @Column({default: false})
  isOnSale: boolean;

  @Column({default: 0})
  stock: number;

  @Column({default: true})
  isActive: boolean;

  @Column({default: false})
  isFeatured: boolean;

  @Column('simple-array', {nullable: true})
  tags: string[];

  @Column({type: 'jsonb', nullable: true})
  attributes: Record<string, any>;

  @Column('decimal', {precision: 10, scale: 2, default: 0})
  weight: number;

  @Column({nullable: true})
  dimensions: string;

  @Column({nullable: true})
  brand: string;

  @Column({nullable: true})
  manufacturer: string;

  @Column({type: 'int', default: 0})
  viewCount: number;

  @Column({type: 'int', default: 0})
  salesCount: number;

  @Column({type: 'int', default: 0})
  likesCount: number;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
  averageRating: number;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable({name: 'product_categories'})
  categories: Category[];

  @OneToMany(() => ProductImage, image => image.product)
  images: ProductImage[];

  // @OneToMany(() => ProductVariant, variant => variant.product)
  // variants: ProductVariant[];

  @ManyToMany(() => Supplier)
  @JoinTable({name: 'product_suppliers'})
  suppliers: Supplier[];

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableTo: Date;

  @Column({ nullable: true })
  metaTitle: string;

  @Column('text', { nullable: true })
  metaDescription: string;

  @Column({ nullable: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}