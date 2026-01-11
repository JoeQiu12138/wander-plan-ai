export class CreateTripDto {
  title: string;
  destination?: string; // ? 表示可选
  startDate: string; // 前端传过来通常是字符串格式的日期
  endDate: string;
  userId: string; // 暂时手动传 User ID，后面做登录功能时会自动获取
}
