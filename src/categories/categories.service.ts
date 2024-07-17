import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async createCategory(createCategoryDto: CreateCategoryDto, user: User) {
    try {
      const { ...categoryDetails } = createCategoryDto;
      const newCategory = this.categoryRepository.create({
        ...categoryDetails,
        user,
      });
      await this.categoryRepository.save(newCategory);
      return {
        status: true,
        message: 'Category created successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }
  async getAllCategories(user: User, typeCategory: string) {
    try {
      if (typeCategory === 'all') {
        typeCategory = undefined;
      }
      console.log(typeCategory);
      const categories = await this.categoryRepository.find({
        where: { user: { id: user.id }, type: typeCategory },
        order: { createAt: 'DESC' }
      });

      return categories;
    } catch (error) {
      console.error(error);
    }
  }

  async getCategoryById(id: string) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      return category;
    } catch (error) {

    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.categoryRepository.update(id, updateCategoryDto);
      return {
        status: true,
        message: 'Category updated successfully',
      }
    } catch (error) {
      console.log(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
