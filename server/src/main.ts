import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 允许跨域，方便前端调用
  app.enableCors();
  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
}
void bootstrap();
