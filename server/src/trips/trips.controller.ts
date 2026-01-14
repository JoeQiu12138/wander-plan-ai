import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AiService } from 'src/ai/ai.service'; // <--- 引入 AI 服务

@Controller('trips')
export class TripsController {
  // 注入 TripsService 和 AiService
  constructor(
    private readonly tripsService: TripsService,
    private readonly aiService: AiService // <--- 注入
  ) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Post('activities')
  addActivity(@Body() body: { tripDayId: string; title: string; location?: string; description?: string }) {
    return this.tripsService.addActivity(body.tripDayId, body);
  }

  // --- 新增：核心功能 "生成并保存" ---
  @Post(':id/generate-plan')
  async generatePlan(@Param('id') id: string) {
    // 1. 先去数据库查这个行程的信息 (我们需要知道去哪? 去几天?)
    const trip = await this.tripsService.findOne(id);
    if (!trip) return { error: 'Trip not found' };

    // 计算天数
    const daysCount = trip.days.length || 3; // 默认3天

    // 2. 调用 (假) AI 生成数据
    const aiResult = await this.aiService.generateItinerary(trip.destination || 'Unknown', daysCount);

    // 3. 把生成的数据存回数据库 (这是最复杂的一步，交给 Service 处理)
    return this.tripsService.saveAiPlan(id, aiResult.plan);
  }
  // ----------------------------------

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }

  // 删除单个活动的 API
  @Delete('activities/:id')
  removeActivity(@Param('id') id: string) {
    return this.tripsService.removeActivity(id);
  }

  // 更新活动的接口
  @Patch('activities/:id')
  updateActivity(
    @Param('id') id: string,
    @Body() body: { title?: string; location?: string; description?: string },
  ) {
    return this.tripsService.updateActivity(id, body);
  }
}
