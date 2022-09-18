import { Module } from '@nestjs/common';
import { ClubMemberService } from './club-member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';

@Module({
  providers: [ClubMemberService],
  imports: [TypeOrmModule.forFeature([ClubEntity, MemberEntity])],
})
export class ClubMemberModule {}
