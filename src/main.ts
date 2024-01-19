import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Consola');

  app.setGlobalPrefix(process.env.API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
      // transformOptions:{
      //   enableImplicitConversion: true
      // }
    }),
  );
  await app.listen(process.env.PORT);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
