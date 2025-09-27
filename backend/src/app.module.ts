import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppDataSource } from './database/data-source';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { AuthorizationModule } from './authorization/authorization.module';


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
    AuthModule,
    AiModule,
    AuthorizationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}