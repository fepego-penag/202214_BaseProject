import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { Repository } from 'typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class ClubMemberService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,

    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async addMemberToClub(clubId: string, memberId: string): Promise<ClubEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['clubs'],
    });
    this.checkIfMemberExists(member);

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    this.checkIfClubExists(club);

    club.members = [...club.members, member];
    return await this.clubRepository.save(club);
  }

  async findMembersFromClub(clubId: string): Promise<MemberEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    this.checkIfClubExists(club);
    return club.members;
  }

  async findMemberFromClub(
    clubId: string,
    memberId: string,
  ): Promise<MemberEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    this.checkIfMemberExists(member);
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    this.checkIfClubExists(club);
    const associateMember: MemberEntity = club.members.find(
      (m) => m.id === member.id,
    );

    if (!associateMember)
      throw new BusinessLogicException(
        'The member does not belong to this club',
        BusinessError.PRECONDITION_FAILED,
      );

    return associateMember;
  }

  async updateMembersFromClub(
    clubId: string,
    newMembersList: MemberEntity[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    this.checkIfClubExists(club);

    for (const m of newMembersList) {
      const memberDB = await this.memberRepository.findOne({
        where: { id: m.id },
      });
      this.checkIfMemberExists(memberDB);
    }
    club.members = newMembersList;
    return await this.clubRepository.save(club);
  }

  async deleteMemberFromClub(clubId: string, memberId: string) {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    this.checkIfMemberExists(member);
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    this.checkIfClubExists(club);

    const associateMember: MemberEntity = club.members.find(
      (m) => m.id === member.id,
    );
    if (!associateMember)
      throw new BusinessLogicException(
        'The member does not belong to this club',
        BusinessError.PRECONDITION_FAILED,
      );
    club.members = club.members.filter((m) => m.id !== memberId);
    await this.clubRepository.save(club);
  }

  private checkIfMemberExists(member: MemberEntity) {
    if (!member)
      throw new BusinessLogicException(
        'Member not found',
        BusinessError.NOT_FOUND,
      );
  }

  private checkIfClubExists(club: ClubEntity) {
    if (!club)
      throw new BusinessLogicException(
        'Club not found',
        BusinessError.NOT_FOUND,
      );
  }
}
