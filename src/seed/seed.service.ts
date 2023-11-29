import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async runSeed() {
    await this.delateTables();
    const adminUsers = await this.insertUsers();
    await this.insertNewProducts(adminUsers);
    return 'SEED FINISHED';

  }

  private async insertUsers(){
    const seedUsers = initialData.users;
    const users: User[]= [];
    seedUsers.forEach(user=>{
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async insertNewProducts(user:User) {
    await this.productsService.deleteAllProducts();
    const product = initialData.products;
    const insertPromises =[];
    product.forEach(product=>{
      insertPromises.push(this.productsService.create(product,user));
    });
    await Promise.all(insertPromises);
    return true;
  }

  private async delateTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder('user');
    await queryBuilder.delete().where({}).execute();
  }
}
