import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TransfersService } from 'src/transfers/transfers.service';
import { TransfersModule } from 'src/transfers/transfers.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService,TransfersService],
  imports: [AuthModule,TransfersModule],
  exports: [AnalyticsService]

})
export class AnalyticsModule { }
