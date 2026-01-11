import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  // 模拟 AI 生成行程 (Mock Mode)
  async generateItinerary(destination: string, days: number) {
    console.log(`[Mock AI] 正在假装为 ${destination} 生成 ${days} 天的行程...`);

    // 1. 模拟网络延迟 (假装思考 1.5 秒)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const plan: any[] = [];

    for (let i = 1; i <= days; i++) {
      plan.push({
        day: i,
        activities: [
          {
            title: `[${destination}] 经典地标游 ${i}-A`,
            description: `这是 AI 为你在 ${destination} 推荐的上午活动，非常精彩。`,
            location: `${destination} 市中心`,
          },
          {
            title: `[${destination}] 美食探索 ${i}-B`,
            description: `中午在这里享用 ${destination} 的特色午餐。`,
            location: `${destination} 美食街`,
          },
          {
            title: `[${destination}] 夜景欣赏 ${i}-C`,
            description: `晚上去高处欣赏 ${destination} 的美丽夜景。`,
            location: `${destination} 观景台`,
          }
        ]
      });
    }

    // 3. 返回符合格式的数据
    return { plan };
  }
}
