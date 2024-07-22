import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { PaginationCategoryDto } from './dto/pagination-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  // USER++
  @Post('createCategory')
  @Auth(ValidRoles.user)
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.createCategory(createCategoryDto, user);
  }

  // USER++
  @Get('getCategories')
  @Auth(ValidRoles.user)
  getCategories(
    @GetUser() user: User, @Query('typeCategory') typeCategory: string) {
    return this.categoriesService.getCategories(user, typeCategory);
  }
  // USER
  @Get('getCategoryBalance')
  @Auth(ValidRoles.user)
  getCategoryBalance(
    @GetUser() user: User, @Query() paginationCategoryDto: PaginationCategoryDto) {
    return this.categoriesService.getCategoryBalance(user, paginationCategoryDto);
  }

  // USER++
  @Get('getCategory/:id')
  @Auth(ValidRoles.user)
  getCategory(@GetUser() user: User, @Param('id') id: string) {
    return this.categoriesService.getCategory(user, id);
  }
  // USER++
  @Patch('updateCategory/:id')
  @Auth(ValidRoles.user)
  updateCategory(@GetUser() user: User, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(user, id, updateCategoryDto);
  }
  // USER++
  @Delete('deleteCategory/:id')
  @Auth(ValidRoles.user)
  deleteCategory(@GetUser() user: User, @Param('id') id: string) {
    return this.categoriesService.deleteCategory(id, user);
  }
}
