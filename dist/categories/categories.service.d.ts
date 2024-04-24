import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
export declare class CategoriesService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    createCategory(createCategoryDto: CreateCategoryDto, user: User): Promise<{
        status: boolean;
        message: string;
    }>;
    getAllCategories(user: User, typeCategory: string): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        status: boolean;
        message: string;
    }>;
    remove(id: number): string;
}
