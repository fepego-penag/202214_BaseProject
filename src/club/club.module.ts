import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from './club.entity';

@Module({
  providers: [ClubService],
  imports: [TypeOrmModule.forFeature([ClubEntity])],
})
export class ClubModule {}
