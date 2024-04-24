"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("./entities/category.entity");
const typeorm_2 = require("typeorm");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async createCategory(createCategoryDto, user) {
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
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAllCategories(user, typeCategory) {
        try {
            if (typeCategory === 'all') {
                typeCategory = undefined;
            }
            console.log(typeCategory);
            const categories = await this.categoryRepository.find({
                where: { user: { id: user.id }, type: typeCategory },
                order: { createDate: 'DESC' }
            });
            return categories;
        }
        catch (error) {
            console.error(error);
        }
    }
    async getCategoryById(id) {
        try {
            const category = await this.categoryRepository.findOneBy({ id });
            return category;
        }
        catch (error) {
        }
    }
    async update(id, updateCategoryDto) {
        try {
            await this.categoryRepository.update(id, updateCategoryDto);
            return {
                status: true,
                message: 'Category updated successfully',
            };
        }
        catch (error) {
            console.log(error);
        }
    }
    remove(id) {
        return `This action removes a #${id} category`;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map