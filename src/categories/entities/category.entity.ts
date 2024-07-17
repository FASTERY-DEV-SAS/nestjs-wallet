import { User } from 'src/auth/entities/user.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  name: string;

  @Column('text')
  type: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text')
  description: string;

  @CreateDateColumn({})
  createAt: Date;

  @UpdateDateColumn({})
  updateAt: Date;

  @ManyToOne(() => User, (user) => user.categories)
  user: User;

  @OneToMany(() => Transfer, (transfer) => transfer.category)
  transfers: Transfer[];
}

