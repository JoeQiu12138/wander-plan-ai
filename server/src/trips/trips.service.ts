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
  update(id: number, updateTripDto: UpdateTripDto) { return `This action updates a #${id} trip`; }
  remove(id: number) { return `This action removes a #${id} trip`; }
}
