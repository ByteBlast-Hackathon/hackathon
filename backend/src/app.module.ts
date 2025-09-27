import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppDataSource } from './database/data-source';
import { UserModule } from './user/user.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
      retryAttempts: 5,
      retryDelay: 5000
    }),
    UserModule,
    AiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}