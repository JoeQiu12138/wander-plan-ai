import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from 'src/prisma.service'; // 引入刚才写的连接器

@Injectable()
export class TripsService {
  // 1. 注入 PrismaService
  constructor(private prisma: PrismaService) {}

  // 创建行程
  async create(createTripDto: CreateTripDto) {
    const startDate = new Date(createTripDto.startDate);
    const endDate = new Date(createTripDto.endDate);

    // 1. 计算旅行总天数 (结束日期 - 开始日期)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 2. 准备好每一天的数据
    const daysData: { dayIndex: number; date: Date }[] = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      daysData.push({
        dayIndex: i,
        date: currentDay,
      });
    }

    // 3. 写入数据库 (同时创建 Trip 和 它的 Days)
    return this.prisma.trip.create({
      data: {
        title: createTripDto.title,
        destination: createTripDto.destination,
        startDate: startDate,
        endDate: endDate,
        user: {
          connectOrCreate: {
            where: { email: 'demo@example.com' },
            create: { email: 'demo@example.com', password: 'pwd', name: 'Demo' }
          },
        },
        // 关键：这里顺便把 Days 也创建了
        days: {
          create: daysData,
        },
      },
    });
  }

  // 查询所有行程
  async findAll() {
    return this.prisma.trip.findMany({
      include: { user: true }, // 顺便把关联的用户信息也查出来
      orderBy: { createdAt: 'desc' }, // 按创建时间倒序（最新的在前面）
    });
  }

  // 下面这三个暂时先不动，以后再写
  // 查找单个行程

  async findOne(id: string) {
    return this.prisma.trip.findUnique({
      where: { id },
      include: {
        days: {
          include: { activities: true }, // 把每一天里的活动也查出来
          orderBy: { dayIndex: 'asc' }, // 按第1天、第2天排序
        },
      },
    });
  }

  // 核心：把 AI 生成的 JSON 保存到数据库的 Activity 表里
  async saveAiPlan(tripId: string, plan: any[]) {
    // 1. 先找出这个 Trip 所有的 Days
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { days: { orderBy: { dayIndex: 'asc' } } }
    });

    if (!trip) throw new Error('Trip not found');

    // 2. 遍历每一天，把 AI 的活动填进去
    // 注意：AI 返回的 day 是从 1 开始，数据库 dayIndex 是从 0 开始
    for (const dayPlan of plan) {
      const dayIndex = dayPlan.day - 1;

      // 找到对应的数据库记录
      if (trip.days[dayIndex]) {
        const dayId = trip.days[dayIndex].id;

        // 先清空这一天旧的活动 (可选，防止重复生成堆积)
        //await this.prisma.tripActivity.deleteMany({ where: { tripDayId: dayId }});

        // 插入新活动
        for (const activity of dayPlan.activities) {
          await this.prisma.tripActivity.create({
            data: {
              title: activity.title,
              description: activity.description,
              location: activity.location,
              tripDayId: dayId,
            },
          });
        }
      }
    }

    return { success: true };
  }

  async addActivity(tripDayId: string, data: { title: string; location?: string; description?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.tripActivity.create({
      data: {
        tripDayId, // 关联到具体某一天
        title: data.title,
        location: data.location,
        description: data.description,
      },
    });
  }

  update(id: number, updateTripDto: UpdateTripDto) { return `This action updates a #${id} trip`; }
  // 删除行程
  async remove(id: string) {
    return this.prisma.trip.delete({
      where: { id },
    });
  }

  // 删除单个活动
  async removeActivity(activityId: string) {
    return this.prisma.tripActivity.delete({
      where: { id: activityId },
    });
  }

  // 更新活动
  async updateActivity(activityId: string, data: { title?: string; location?: string; description?: string }) {
    return this.prisma.tripActivity.update({
      where: { id: activityId },
      data,
    });
  }
}
