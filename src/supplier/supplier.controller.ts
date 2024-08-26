import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly supplierService: SupplierService,
  ) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Get('document/:documentNumber')
  findByDocumentNumber(@Param('documentNumber') documentNumber: string) {
    return this.supplierService.findByDocumentNumber(documentNumber);
  }
}
