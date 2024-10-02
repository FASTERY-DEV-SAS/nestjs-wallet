import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationCategoryDto } from './dto/pagination-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  // USER++
  async createCategory(createCategoryDto: CreateCategoryDto, user: User): Promise<{
    statusCode: HttpStatus;
    message: string;
    categoryId: string;
  }> {
    try {
      const { ...categoryDetails } = createCategoryDto;
      const createCategoryProv = this.categoryRepository.create({
        ...categoryDetails,
        user,
      });
      const newCategory = await this.categoryRepository.save(createCategoryProv);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Categoria creada correctamente',
        categoryId: newCategory.id,
      };
    } catch (error) {
      this.logger.error(`Error in createCategory`, error.stack);
      if (error instanceof BadRequestException) {
        error.message || 'Error en crear la categoria';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error en crear la categoria',
        );
      }
    }
  }
  // USER++
  async getCategories(user: User, typeCategory: string) {
    try {
      const categoryFilter = typeCategory === 'all' ? {} : { type: typeCategory };
      const categories = await this.categoryRepository.find({
        where: { user: { id: user.id }, ...categoryFilter },
        order: { createAt: 'DESC' }
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Categorias obtenidas correctamente',
        categories
      }
    } catch (error) {
      this.logger.error(`Error in getCategories`);
      if (error instanceof BadRequestException) {
        error.message || 'Error en obtener las categorias';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error en obtener las categorias',
        );
      }
    }
  }
  // USER++
  async getCategoriesBalance(user: User, paginationCategoryDto: PaginationCategoryDto) {
    const { month, year, categoryId, type } = paginationCategoryDto;
    try {
      const query = this.categoryRepository.createQueryBuilder('category')
        .leftJoin('category.transfers', 'transfer')
        .select('category.id', 'id')
        .addSelect('category.name', 'name')
        .addSelect('category.type', 'type')
        .addSelect('SUM(transfer.total)', 'balance')
        .addSelect('COUNT(transfer.id)', 'transferNumber')
        .where('category.userId = :userId', { userId: user.id })
        .groupBy('category.id');

      if (categoryId) {
        query.andWhere('category.id = :categoryId', { categoryId });
      }
      if (type) {
        query.andWhere('category.type = :type', { type });
      }


      if (month) {
        query.andWhere('EXTRACT(MONTH FROM transfer.createAt) = :month', { month });
      }

      if (year) {
        query.andWhere('EXTRACT(YEAR FROM transfer.createAt) = :year', { year });
      }

      const categories = await query.getRawMany();

      return {
        statusCode: HttpStatus.OK,
        message: 'Categorias obtenidas correctamente',
        categories: categories.map(category => ({
          id: category.id,
          type: category.type,
          name: category.name,
          balance: +category.balance || 0 as number,
          transferNumber: category.transferNumber || 0,
        })),
      };
    } catch (error) {
      this.logger.error(`Error in getCategories`);
      if (error instanceof BadRequestException) {
        error.message || 'Error en obtener las categorias';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error en obtener las categorias',
        );
      }
    }
  }
  // USER++
  async getCategory(user: User, id: string): Promise<{
    statusCode: HttpStatus;
    message: string;
    category: Category;
  }> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { user: { id: user.id }, id },
      });
      if (!category) {
        throw new BadRequestException('Categoria no existe');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Categoria obtenida correctamente',
        category
      };
    } catch (error) {
      this.logger.error(`Error in getCategory`);
      if (error instanceof BadRequestException) {
        error.message || 'Error en obtener la categoria';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error en obtener la categoria',
        );
      }
    }
  }
  // USER++
  async updateCategory(user: User, id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
    statusCode: HttpStatus;
    message: string;
    categoryId: string;
  }> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id, user: { id: user.id } } });
      if (!category) {
        throw new BadRequestException('Categoria no existe');
      }
      await this.categoryRepository.update(id, updateCategoryDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Actualizado correctamente',
        categoryId: category.id,
      }
    } catch (error) {
      this.logger.error(`Error in updateCategory`);
      if (error instanceof BadRequestException) {
        error.message || 'Error en actualizar la categoria';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error en actualizar la categoria',
        );
      }
    }
  }
  // USER++
  async deleteCategory(id: string, user: User): Promise<{
    statusCode: HttpStatus;
    message: string;
  }> {
    try {
      // Verificar si la categoría existe
      const category = await this.categoryRepository.findOne({ where: { id, user: { id: user.id } } });
      if (!category) {
        throw new BadRequestException('Categoria no existe');
      }

      // Eliminar la categoría
      await this.categoryRepository.delete(id);

      // Retornar respuesta exitosa
      return {
        statusCode: HttpStatus.OK,
        message: 'Categoria eliminada correctamente',
      };
    } catch (error) {
      this.logger.error('Error in deleteCategory', error.stack);

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message || 'Error en eliminar la categoria');
      } else {
        throw new InternalServerErrorException('Error en eliminar la categoria');
      }
    }
  }

}
