import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: { destination: string; days: number }) {
    console.log(`正在为 ${body.destination} 生成 ${body.days} 天的行程...`);
    return this.aiService.generateItinerary(body.destination, body.days);
  }
}
