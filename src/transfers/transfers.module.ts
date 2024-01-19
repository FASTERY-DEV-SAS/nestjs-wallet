import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    TypeOrmModule.forFeature([
      Transfer
    ])
  ],
})
export class TransfersModule {}
