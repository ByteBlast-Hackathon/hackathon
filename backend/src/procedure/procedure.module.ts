import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedure } from './procedure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Procedure])],
  providers: [],
  controllers: [],
})
export class ProceduresModule {}