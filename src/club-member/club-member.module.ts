import { Module } from '@nestjs/common';
import { ClubMemberService } from './club-member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { ClubMemberController } from './club-member.controller';

@Module({
  providers: [ClubMemberService],
  imports: [TypeOrmModule.forFeature([ClubEntity, MemberEntity])],
  controllers: [ClubMemberController],
})
export class ClubMemberModule {}
