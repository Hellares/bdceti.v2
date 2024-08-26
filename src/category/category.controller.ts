import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService
  ) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get('tree')
  getTree(): Promise<Category[]> {
    return this.categoryService.getTree();
  }

  @Get('search')
  search(@Query('query') query: string): Promise<Category[]> {
    return this.categoryService.searchCategories(query);
  }

  @Get('with-products')
  getCategoriesWithProducts(): Promise<Category[]> {
    return this.categoryService.getCategoriesWithProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(+id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoryService.findBySlug(slug);
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string): Promise<Category[]> {
    return this.categoryService.getChildren(+id);
  }

  @Get(':id/parents')
  getParents(@Param('id') id: string): Promise<Category[]> {
    return this.categoryService.getParents(+id);
  }

  @Get(':id/breadcrumbs')
  getBreadcrumbs(@Param('id') id: string): Promise<Category[]> {
    return this.categoryService.getCategoryBreadcrumbs(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(+id);
  }

  @Post(':parentId/child')
  addChild(@Param('parentId') parentId: string, @Body() childData: CreateCategoryDto): Promise<Category> {
    return this.categoryService.addChild(+parentId, childData);
  }

  @Put(':id/move/:newParentId')
  moveCategory(@Param('id') id: string, @Param('newParentId') newParentId: string): Promise<Category> {
    return this.categoryService.moveCategory(+id, +newParentId);
  }

}
