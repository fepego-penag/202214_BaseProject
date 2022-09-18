import { Test, TestingModule } from '@nestjs/testing';
import { ClubMemberService } from './club-member.service';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let mockClub: ClubEntity;
  let mockMemberList: MemberEntity[];

  const seedDatabase = async () => {
    await memberRepository.clear();
    await clubRepository.clear();
    mockMemberList = [];
    for (let i = 0; i < 5; i++) {
      const member: MemberEntity = await memberRepository.save({
        userName: faker.name.fullName(),
        email: faker.internet.email(),
        dateBirth: faker.date.past(),
      });
      mockMemberList.push(member);
    }
    mockClub = await clubRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(10),
      presentationImage: faker.internet.url(),
      startBusinessDate: faker.date.past(),
      members: mockMemberList,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

    service = module.get<ClubMemberService>(ClubMemberService);
    memberRepository = await module.get<Repository<MemberEntity>>(
      getRepositoryToken(MemberEntity),
    );
    clubRepository = await module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add a member to a club', async () => {
    const index = mockMemberList.length;
    const member: MemberEntity = await memberRepository.save({
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
      clubs: [],
    });

    const result: ClubEntity = await service.addMemberToClub(
      mockClub.id,
      member.id,
    );

    expect(result).not.toBeNull();
    expect(result.members.length).toBe(index + 1);
    expect(result.members[index]).not.toBeNull();
    expect(result.members[index].userName).toBe(member.userName);
    expect(result.members[index].email).toBe(member.email);
    expect(result.members[index].dateBirth).toStrictEqual(member.dateBirth);
  });

  it('addMemberToClub should thrown exception for an invalid member', async () => {
    await expect(() =>
      service.addMemberToClub(mockClub.id, '0'),
    ).rejects.toHaveProperty('message', 'Member not found');
  });

  it('addMemberToClub should thrown exception for an invalid club', async () => {
    const member: MemberEntity = await memberRepository.save({
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
      clubs: [],
    });

    await expect(() =>
      service.addMemberToClub('0', member.id),
    ).rejects.toHaveProperty('message', 'Club not found');
  });

  it('findMemberFromClub should return a member from club', async () => {
    const member: MemberEntity = mockMemberList[0];
    const memberDB: MemberEntity = await service.findMemberFromClub(
      mockClub.id,
      member.id,
    );
    expect(memberDB).not.toBeNull();
    expect(memberDB.userName).toBe(member.userName);
    expect(memberDB.email).toBe(member.email);
    expect(memberDB.dateBirth).toStrictEqual(member.dateBirth);
  });

  it('findMemberFromClub should return an error when member dont exists', async () => {
    await expect(() =>
      service.findMemberFromClub(mockClub.id, '0'),
    ).rejects.toHaveProperty('message', 'Member not found');
  });

  it('findMemberFromClub should return an error when member dont belong to club', async () => {
    const member: MemberEntity = await memberRepository.save({
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
      clubs: [],
    });
    await expect(() =>
      service.findMemberFromClub(mockClub.id, member.id),
    ).rejects.toHaveProperty(
      'message',
      'The member does not belong to this club',
    );
  });

  it('findMembersFromClub should return associate members of a club', async () => {
    const clubMembers: MemberEntity[] = await service.findMembersFromClub(
      mockClub.id,
    );
    expect(clubMembers.length).toBe(mockMemberList.length);
  });

  it('findMembersFromClub should return error caused by invalid club', async () => {
    await expect(() => service.findMembersFromClub('0')).rejects.toHaveProperty(
      'message',
      'Club not found',
    );
  });

  it('updateMembersFromClub should return new associated list of members', async () => {
    const member: MemberEntity = await memberRepository.save({
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
      clubs: [],
    });
    const newListMember = [member];

    const modifiedClub: ClubEntity = await service.updateMembersFromClub(
      mockClub.id,
      newListMember,
    );

    expect(modifiedClub).not.toBeNull();
    expect(modifiedClub.members.length).toBe(1);
    expect(modifiedClub.members[0]).not.toBeNull();
    expect(modifiedClub.members[0].userName).toBe(member.userName);
    expect(modifiedClub.members[0].email).toBe(member.email);
    expect(modifiedClub.members[0].dateBirth).toStrictEqual(member.dateBirth);
  });

  it('findMembersFromClub should return error caused by not existing member on DB', async () => {
    const member: MemberEntity = {
      id: '1111',
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
      clubs: [],
    };
    const newListMember = [member];
    await expect(() =>
      service.updateMembersFromClub(mockClub.id, newListMember),
    ).rejects.toHaveProperty('message', 'Member not found');
  });

  it('findMembersFromClub should return error caused by invalid club', async () => {
    const newListMember = [mockMemberList[0]];
    await expect(() =>
      service.updateMembersFromClub('0', newListMember),
    ).rejects.toHaveProperty('message', 'Club not found');
  });

  it('deleteMemberFromClub should remove a member from a club', async () => {
    const member: MemberEntity = mockMemberList[0];

    await service.deleteMemberFromClub(mockClub.id, member.id);

    const clubDb: ClubEntity = await clubRepository.findOne({
      where: { id: mockClub.id },
      relations: ['members'],
    });
    const deletedMember: MemberEntity = clubDb.members.find(
      (m) => m.id === member.id,
    );

    expect(deletedMember).toBeUndefined();
  });

  it('deleteMemberFromClub should throw an error caused by a not associate a member from a club', async () => {
    await expect(() =>
      service.deleteMemberFromClub(mockClub.id, '0'),
    ).rejects.toHaveProperty('message', 'Member not found');
  });

  it('deleteMemberFromClub should throw an error caused by a not existing club', async () => {
    const member = mockMemberList[0];
    await expect(() =>
      service.deleteMemberFromClub('0', member.id),
    ).rejects.toHaveProperty('message', 'Club not found');
  });
});
