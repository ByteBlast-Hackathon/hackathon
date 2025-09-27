import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception/exception';
import { initializeDataSource } from './database/data-source';

async function bootstrap() {
  try {
    
    await initializeDataSource();
    console.log('✅ DataSource inicializado com sucesso');
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors();

   
    const config = new DocumentBuilder()
      .setTitle('API NestJS - CRUD de Usuário')
      .setDescription('Documentação completa da API gerada pelo Gemini 2.5 Pro.')
      .setVersion('1.0')
      .addTag('Users', 'Operações relacionadas a usuários')
      .addTag('AI', 'Operações de IA')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    
    const port = process.env.APP_PORT || 3000;
    await app.listen(port);
    
    console.log(`🚀 Aplicação rodando na porta: ${port}`);
    console.log('RODANDO API ATUALIZADA');
    console.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api-docs`);

  } catch (error) {
    console.error('❌ Falha ao iniciar a aplicação:', error.message);
    process.exit(1);
  }
}

bootstrap();