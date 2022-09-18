import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import mock = jest.mock;

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: Repository<MemberEntity>;
  let mockMemberList: MemberEntity[];

  const seedDatabase = async () => {
    memberRepository.clear();
    mockMemberList = [];
    for (let i = 0; i < 5; i++) {
      const member: MemberEntity = await memberRepository.save({
        userName: faker.name.fullName(),
        email: faker.internet.email(),
        dateBirth: faker.date.past(),
      });
      mockMemberList.push(member);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
    memberRepository = module.get<Repository<MemberEntity>>(
      getRepositoryToken(MemberEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const museums: MemberEntity[] = await service.findAll();
    expect(museums).not.toBeNull();
    expect(museums).toHaveLength(mockMemberList.length);
  });

  it('findOne should return a Member by id', async () => {
    const mockedMember: MemberEntity = mockMemberList[0];
    const memberDB: MemberEntity = await service.findOne(mockedMember.id);
    expect(memberDB).not.toBeNull();
    expect(memberDB.userName).toEqual(mockedMember.userName);
    expect(memberDB.dateBirth).toEqual(mockedMember.dateBirth);
    expect(memberDB.email).toEqual(mockedMember.email);
  });

  it('findOne should throw an exception for an invalid member', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Member not found',
    );
  });

  it('create should return a new Member', async () => {
    const newMockMember: {
      id: string;
      userName: string;
      dateBirth: Date;
      email: string;
    } = {
      id: '',
      userName: faker.name.fullName(),
      email: faker.internet.email(),
      dateBirth: faker.date.past(),
    };
    const newMember: MemberEntity = await service.create(newMockMember);
    expect(newMember).not.toBeNull();

    const memberDB: MemberEntity = await memberRepository.findOne({
      where: { id: newMember.id },
    });
    expect(memberDB).not.toBeNull();
    expect(memberDB.userName).toEqual(newMockMember.userName);
    expect(memberDB.dateBirth).toEqual(newMockMember.dateBirth);
    expect(memberDB.email).toEqual(newMockMember.email);
  });

  it('create should return error caused by wrong email format', async () => {
    const newMockMember: {
      id: string;
      userName: string;
      dateBirth: Date;
      email: string;
    } = {
      id: '',
      userName: faker.name.fullName(),
      email: 'nonValidEmail.com',
      dateBirth: faker.date.past(),
    };

    await expect(() => service.create(newMockMember)).rejects.toHaveProperty(
      'message',
      'Email is not valid',
    );
  });

  it('update should modify a member', async () => {
    const mockMember: MemberEntity = mockMemberList[0];
    mockMember.userName = 'New name';
    mockMember.dateBirth = new Date('2000-02-02');
    const updatedMember: MemberEntity = await service.update(
      mockMember.id,
      mockMember,
    );
    expect(updatedMember).not.toBeNull();
    const memberDB: MemberEntity = await memberRepository.findOne({
      where: { id: mockMember.id },
    });
    expect(memberDB).not.toBeNull();
    expect(memberDB.userName).toEqual(mockMember.userName);
    expect(memberDB.dateBirth).toEqual(mockMember.dateBirth);
    expect(memberDB.email).toEqual(mockMember.email);
  });

  it('update should return error caused by not valid email', async () => {
    const mockMember: MemberEntity = mockMemberList[0];
    mockMember.userName = 'New name';
    mockMember.email = 'nonValidEmail.com';

    await expect(() =>
      service.update(mockMember.id, mockMember),
    ).rejects.toHaveProperty('message', 'Email is not valid');
  });

  it('update should throw an exception for an invalid member', async () => {
    let member: MemberEntity = mockMemberList[0];
    member = {
      ...member,
      userName: 'New name',
      dateBirth: new Date('2000-02-02'),
    };
    await expect(() => service.update('0', member)).rejects.toHaveProperty(
      'message',
      'Member not found',
    );
  });

  it('delete should remove a member', async () => {
    const member: MemberEntity = mockMemberList[0];
    await service.delete(member.id);
    const deletedMuseum: MemberEntity = await memberRepository.findOne({
      where: { id: member.id },
    });
    expect(deletedMuseum).toBeNull();
  });

  it('delete should throw an exception for an invalid member', async () => {
    const member: MemberEntity = mockMemberList[0];
    await service.delete(member.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'Member not found',
    );
  });
});
