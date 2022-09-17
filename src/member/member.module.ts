import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './member.entity';

@Module({
  providers: [MemberService],
  imports: [TypeOrmModule.forFeature([MemberEntity])],
})
export class MemberModule {}
