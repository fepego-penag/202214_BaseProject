import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './member.entity';
import { MemberController } from './member.controller';

@Module({
  providers: [MemberService],
  imports: [TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
})
export class MemberModule {}
