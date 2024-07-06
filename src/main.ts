import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  const port = process.env.PORT || 3000;
  //await app.listen(port, '192.168.100.10' || 'localhost');
  await app.listen(port);
}
bootstrap();
