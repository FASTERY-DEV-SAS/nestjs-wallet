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
import { envs } from './config';

async function bootstrap() {
    const logger = new Logger('Consola');

    // MICROSERVICIO
    // const microserviceApp = await NestFactory.createMicroservice(AppModule, {
    //     transport: Transport.TCP,
    //     options: {
    //         port: envs.port,
    //     },
    // });
    // microserviceApp.listen();

    // API
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.setGlobalPrefix(envs.apiPrefix);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    await app.listen(envs.port);

    
    logger.log(`Application is running on PORT: ${envs.port}`);
}
bootstrap();
