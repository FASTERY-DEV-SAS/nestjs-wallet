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
  ) {}
  
  async createCategory(createCategoryDto: CreateCategoryDto, user:User) {
    try {
      const { ...categoryDetails } = createCategoryDto;
      const newCategory = this.categoryRepository.create({
        ...categoryDetails,
        user,
      });
      const category = await this.categoryRepository.save(newCategory);
      return { ...category };
    } catch (error) {
      console.log(error);
    } 
  }
  // TODO : SE DEBE SE PUEDA INGRESAR SOLO INGREESO, GASTO Y ALL
  async getAllCategories(user:User, typeCategory: string) {
    try {
      const categories = await this.categoryRepository.find({
        where: { user: { id: user.id }, type: typeCategory},
      });
      return categories;
    } catch (error) {
      
    }
  }

  async getCategoryById(id: string) {
    try {
      const category = await this.categoryRepository.findOneBy({id});
      return category;
    } catch (error) {
      
    }
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
