import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:3000' });

  const port = Number(process.env.API_PORT) || 3001;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
