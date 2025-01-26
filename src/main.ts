import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-ms')

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      rawBody: true,
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  await app.listen(envs.port);

  logger.log(`Payments microservices runing on port ${envs.port}`)
}
bootstrap();
