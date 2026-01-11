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
    return this.prisma.trip.create({
      data: {
        title: createTripDto.title,
        destination: createTripDto.destination,
        startDate: new Date(createTripDto.startDate), // 把字符串转成日期对象
        endDate: new Date(createTripDto.endDate),
        // 这里有一个临时操作：因为我们还没做登录，我们需要先创建一个假用户，
        // 或者让数据库直接关联到一个已存在的 User ID。
        // 为了演示方便，我们这里先写死关联到一个新创建的用户，或者你之后手动改
        user: {
          connectOrCreate: {
            where: { email: 'demo@example.com' },
            create: {
              email: 'demo@example.com',
              password: 'hashed_password', // 暂时随便写
              name: 'Demo User',
            },
          },
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
  findOne(id: number) { return `This action returns a #${id} trip`; }
  update(id: number, updateTripDto: UpdateTripDto) { return `This action updates a #${id} trip`; }
  remove(id: number) { return `This action removes a #${id} trip`; }
}
