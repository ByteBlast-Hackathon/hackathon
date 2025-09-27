import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { Procedure } from '../procedure/procedure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Procedure]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
})
export class AuthorizationModule {}
