import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('wallet-api-logger');

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.setGlobalPrefix(envs.apiPrefix);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('NESTJS WALLET API')
        .setDescription('The NESTJS WALLET API description')
        .addBearerAuth()
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(envs.port);

    logger.log(`Application is running on PORT: ${envs.port}`);
}
bootstrap();
