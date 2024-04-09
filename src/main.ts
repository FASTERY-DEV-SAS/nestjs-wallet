// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { Logger, ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const logger = new Logger('Consola');

//   app.enableCors();

//   app.setGlobalPrefix(process.env.API_PREFIX);
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   );
//   await app.listen(process.env.PORT);
//   logger.log(`Application is running on: ${await app.getUrl()}`);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Consola');

    app.enableCors();

    app.setGlobalPrefix(process.env.API_PREFIX);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    await app.listen(process.env.PORT);
    logger.log(`Application is running on: ${await app.getUrl()}`);

    // MICROSERVICIO
    const microserviceApp = await NestFactory.createMicroservice(AppModule, {
        // transport: Transport.RMQ,
        // options: {
        //     urls: [process.env.RABBITMQ_URL],
        //     queue: process.env.RABBITMQ_QUEUE_NAME,
        //     queueOptions: {
        //         durable: false,
        //     },
        // },
        transport: Transport.TCP,
        options: {
            port: 5000,
        },
    });
    microserviceApp.listen();
}
bootstrap();
