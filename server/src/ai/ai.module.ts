import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // <--- 关键！必须导出，别的模块才能用
})
export class AiModule {}
