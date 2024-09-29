import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) 
    //private categoryRepository: TreeRepository<Category>,
    private categoryRepository: Repository<Category>,
    private readonly filesService: FilesService,
    private dataSource: DataSource,
  ) {}

  //   async create(file: Express.Multer.File, createCategoryDto: CreateCategoryDto): Promise<Category> {
  //   if(!file){
  //     throw new BadRequestException('Seleccione una imagen');
  //   }

  //   let { name, parentId } = createCategoryDto;
  //   let slug = createCategoryDto.slug || slugify(name);
    
  //   // Verificar si el slug ya existe
  //   const existingCategory = await this.categoryRepository.findOne({ where: { slug } });
  //   if (existingCategory) {
  //     throw new ConflictException(`A category with slug "${slug}" already exists`);
  //   }

  //   const {secure_url} = await this.filesService.uploadImage(file);
  //   createCategoryDto.imageUrl = secure_url;
  //   let category = this.categoryRepository.create(createCategoryDto);
    
  //   if (parentId) {
  //     const parent = await this.findOne(parentId);
  //     category.parent = parent;
  //   }

  //   await this.categoryRepository.save(category);
  //   return category;
  // }
  async create(file: Express.Multer.File, createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (!file) {
      throw new BadRequestException('Please select an image');
    }

    const { name, parentId } = createCategoryDto;
    const slug = createCategoryDto.slug || slugify(name, { lower: true });

    // Iniciar transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si el slug ya existe
      const existingCategory = await queryRunner.manager.findOne(Category, { where: { slug } });
      if (existingCategory) {
        throw new ConflictException(`A category with slug "${slug}" already exists`);
      }

      // Subir imagen
      const { secure_url } = await this.filesService.uploadImage(file);

      // Crear categoría
      let category = queryRunner.manager.create(Category, {
        name,
        slug,
        imageUrl: secure_url,
      });

      if (parentId) {
        const parent = await queryRunner.manager.findOne(Category, { where: { id: parentId } });
        if (!parent) {
          throw new BadRequestException(`Parent category with id ${parentId} not found`);
        }
        category.parent = parent;
      }

      category = await queryRunner.manager.save(category);

      // Commit transacción
      await queryRunner.commitTransaction();
      return category

    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while creating the category');
    } finally {
      // Liberar queryRunner
      await queryRunner.release();
    }
  }



  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async update(id: number, categoryData: UpdateCategoryDto): Promise<Category> {
    await this.categoryRepository.update(id, categoryData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  //! PARENTS AND CHILDREN ---------------------//

  //Obtiene toda la estructura de árbol de categorías.
  // async getTree(): Promise<Category[]> { 
  //   return this.categoryRepository.findTrees();
  // }

  // //Obtiene todas las subcategorías de una categoría dada.
  // async getChildren(parentId: number): Promise<Category[]> {
  //   const parent = await this.findOne(parentId);
  //   return this.categoryRepository.findDescendants(parent);
  // }

  // //Obtiene todos los ancestros de una categoría.
  // async getParents(childId: number): Promise<Category[]> {
  //   const child = await this.findOne(childId);
  //   return this.categoryRepository.findAncestors(child);
  // }

  //Añade una subcategoría a una categoría existente.
  async addChild(parentId: number, childData: Partial<Category>): Promise<Category> {
    const parent = await this.findOne(parentId);
    const child = this.categoryRepository.create(childData);
    child.parent = parent;
    await this.categoryRepository.save(child);
    return child;
  }

  //Mueve una categoría a un nuevo padre.
  async moveCategory(categoryId: number, newParentId: number): Promise<Category> {
    const category = await this.findOne(categoryId);
    const newParent = await this.findOne(newParentId);
    category.parent = newParent;
    return this.categoryRepository.save(category);
  }

  //Obtiene categorías con sus productos relacionados.
  async getCategoriesWithProducts(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['products'],
    });
  }

  //Busca categorías por nombre o descripción.
  async searchCategories(query: string): Promise<Category[]> {;
    return this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name ILIKE :query OR category.description ILIKE :query', { query: `%${query}%` })
      .getMany();      
  }
}
