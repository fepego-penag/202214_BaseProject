import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClubMemberService } from './club-member.service';
import { MemberDto } from '../member/member.dto';
import { plainToInstance } from 'class-transformer';
import { MemberEntity } from '../member/member.entity';

@Controller('club')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubMemberController {
  constructor(private readonly clubMemberService: ClubMemberService) {}

  @Post(':clubId/member/:memberId')
  async addMemberToClub(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
  ) {
    return await this.clubMemberService.addMemberToClub(clubId, memberId);
  }

  @Get(':clubId/member/:memberId')
  async findMemberFromClub(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
  ) {
    return await this.clubMemberService.findMemberFromClub(clubId, memberId);
  }

  @Get(':clubId/member')
  async findMembersFromClub(@Param('clubId') clubId: string) {
    return await this.clubMemberService.findMembersFromClub(clubId);
  }

  @Put(':clubId/member')
  async updateMembersFromClub(
    @Body() membersDto: MemberDto[],
    @Param('clubId') clubId: string,
  ) {
    const members = plainToInstance(MemberEntity, membersDto);
    return await this.clubMemberService.updateMembersFromClub(clubId, members);
  }

  @Delete(':clubId/member/:memberId')
  @HttpCode(204)
  async deleteMemberFromClub(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
  ) {
    return await this.clubMemberService.deleteMemberFromClub(clubId, memberId);
  }
}
