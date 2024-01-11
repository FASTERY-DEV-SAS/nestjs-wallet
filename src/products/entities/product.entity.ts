import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from ".";
import { User } from "src/auth/entities/user.entity";
 
@Entity({name: 'products'})
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string;

    @Column('float', {
        default: 0.00
    })
    price: number;

    @Column('text', {
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true,
    })
    sizes: string[];

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @Column('text')
    gender: string;

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {
            // cascade: true,
            eager: true
        }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {
            onDelete: 'CASCADE',
            eager: true
        }
    )
    user: User;



    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }
        this.slug = this.slug.toLowerCase().replaceAll(' ', '-').replaceAll('/', '').replaceAll('(', '').replaceAll(')', '').replaceAll("'", '');
    }

    @BeforeInsert()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(' ', '-').replaceAll('/', '').replaceAll('(', '').replaceAll(')', '').replaceAll("'", '');
        
    }


}
