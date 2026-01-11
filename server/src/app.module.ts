import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service'; // <--- 1. 引入它
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [TripsModule],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService, // <--- 2. 添加到 providers 数组
  ],
})
export class AppModule {}
