import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    createCategory(createCategoryDto: CreateCategoryDto, user: User): Promise<{
        status: boolean;
        message: string;
    }>;
    getAllCategories(user: User, typeCategory: string): Promise<import("./entities/category.entity").Category[]>;
    getCategoryById(id: string): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        status: boolean;
        message: string;
    }>;
    remove(id: string): string;
}
