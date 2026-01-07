import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Swagger pour ton backend NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger available at http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}

bootstrap();
