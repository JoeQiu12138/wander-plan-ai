import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaService } from 'src/prisma.service';
import { AiModule } from 'src/ai/ai.module'; // <--- 1. 引入 AiModule

@Module({
  imports: [AiModule], // <--- 2. 这里要导入模块
  controllers: [TripsController],
  providers: [TripsService, PrismaService],
})
export class TripsModule {}
