import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Supplier } from './entities/suppliers.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const { productIds, ...supplierData } = createSupplierDto;

    const existingSupplier = await this.supplierRepository.findOne({
      where: [
        { documentNumber: supplierData.documentNumber },
        { documentType: supplierData.documentType },
      ],
    });

    if (existingSupplier) {
      throw new ConflictException('A supplier with this document number or type already exists');
    }

    const supplier = this.supplierRepository.create(supplierData);

    if (productIds) {
      const products = await this.productRepository.findBy({ id: In(productIds) });
      supplier.products = products;
    }

    return this.supplierRepository.save(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }

    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const { productIds, ...updateData } = updateSupplierDto;

    const supplier = await this.findOne(id);

    if (productIds) {
      const products = await this.productRepository.findBy({ id: In(productIds) });
      supplier.products = products;
    }

    Object.assign(supplier, updateData);

    return this.supplierRepository.save(supplier);
  }

  async remove(id: number): Promise<void> {
    const result = await this.supplierRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }
  }

  async findByDocumentNumber(documentNumber: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { documentNumber },
      relations: ['products'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with document number "${documentNumber}" not found`);
    }

    return supplier;
  }

}
