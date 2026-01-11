import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaService } from 'src/prisma.service'; // <--- 引入

@Module({
  controllers: [TripsController],
  providers: [
    TripsService,
    PrismaService, // <--- 把锅铲发给 Trips 模块
  ],
})
export class TripsModule {}
