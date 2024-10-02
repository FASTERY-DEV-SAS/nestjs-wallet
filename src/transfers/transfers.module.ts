import { forwardRef, Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { Rate } from './entities/rate.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Transfer, Rate]),
    forwardRef(() => WalletsModule),
  ],
  exports: [TransfersService, TypeOrmModule],
})
export class TransfersModule { }
