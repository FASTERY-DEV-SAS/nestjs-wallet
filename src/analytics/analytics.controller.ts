import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('chartTransfers')
  @Auth(ValidRoles.user)
  chartTransfers(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.analyticsService.chartTransfers(user, paginationDto);
  }

}
