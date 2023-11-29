import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage,Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto, user : User) {
    try {
      const {images = [], ...productDetails} = createProductDto; 
      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image})),
        user
      });
      const product = await this.productRepository.save(newProduct);
      return {...product,images};
    } catch (error) {
      this.handleDBException(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      skip: offset,
      take: limit,
      relations: {
        images: true
      }
    });

    return products.map(product=>({...product,images:product.images.map(image=>image.url)}) );
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
      .where('UPPER(title)=:title or slug=:slug', { title: term.toUpperCase(), slug: term.toLowerCase() })
      .leftJoinAndSelect('product.images', 'images')
      .getOne();
    }
    if (!product) throw new BadRequestException('Product not found');
    return product;
  }

  async finOnePlain(term:string) {
    const {images,...rest} = await this.findOne(term);
    return {...rest,images:images.map(image=>image.url)};
  }

  async update(id: string, updateProductDto: UpdateProductDto, user : User) {

    const {images=[], ...rest} = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...rest,
    });
    if (!product) throw new NotFoundException('Product not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {product:{id}});
        product.images = images.map(image => this.productImageRepository.create({url: image}));
      }
      // product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.finOnePlain(id);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBException(error);
    }
      
    // return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return `This action removes a #${id} product`;
  }

  private handleDBException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error creating product');
  }

  async deleteAllProducts() {
    console.log('deleteAllProducts');
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
