import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let mockClubs: ClubEntity[];

  const seedDatabase = async () => {
    await repository.clear();
    mockClubs = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        name: faker.company.name(),
        description: faker.lorem.sentence(10),
        presentationImage: faker.internet.url(),
        startBusinessDate: faker.date.past(),
      });
      mockClubs.push(club);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = await module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(mockClubs.length);
  });

  it('findOne should return a club by id', async () => {
    const mockedClub: ClubEntity = mockClubs[0];
    const clubDB: ClubEntity = await service.findOne(mockedClub.id);
    expect(clubDB).not.toBeNull();
    expect(clubDB.name).toEqual(mockedClub.name);
    expect(clubDB.startBusinessDate).toEqual(mockedClub.startBusinessDate);
    expect(clubDB.description).toEqual(mockedClub.description);
    expect(clubDB.presentationImage).toEqual(mockedClub.presentationImage);
  });

  it('findOne should throw an exception for an invalid Club', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Club not found',
    );
  });

  it('create should return a new Club', async () => {
    const newMockClub: ClubEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.sentence(8),
      presentationImage: faker.internet.url(),
      startBusinessDate: faker.date.past(),
      members: [],
    };
    const newClub: ClubEntity = await service.create(newMockClub);
    expect(newClub).not.toBeNull();

    const clubDB: ClubEntity = await repository.findOne({
      where: { id: newClub.id },
    });
    expect(clubDB).not.toBeNull();
    expect(clubDB.name).toEqual(newMockClub.name);
    expect(clubDB.startBusinessDate).toEqual(newMockClub.startBusinessDate);
    expect(clubDB.description).toEqual(newMockClub.description);
    expect(clubDB.presentationImage).toEqual(newMockClub.presentationImage);
  });

  it('create should return error caused by long description', async () => {
    const newMockClub: ClubEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.paragraph(8),
      presentationImage: faker.internet.url(),
      startBusinessDate: faker.date.past(),
      members: [],
    };

    await expect(() => service.create(newMockClub)).rejects.toHaveProperty(
      'message',
      'description is to long',
    );
  });

  it('create should return error caused by long Presentation Image', async () => {
    const newMockClub: ClubEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.sentence(8),
      presentationImage: faker.lorem.paragraph(8),
      startBusinessDate: faker.date.past(),
      members: [],
    };

    await expect(() => service.create(newMockClub)).rejects.toHaveProperty(
      'message',
      'Presentation image is to long',
    );
  });

  it('update should modify a club', async () => {
    const mockClub: ClubEntity = mockClubs[0];
    mockClub.name = 'New name';
    mockClub.description = faker.lorem.sentence(8);
    const updatedClub: ClubEntity = await service.update(mockClub.id, mockClub);
    expect(updatedClub).not.toBeNull();
    const clubDB: ClubEntity = await repository.findOne({
      where: { id: mockClub.id },
    });
    expect(clubDB).not.toBeNull();
    expect(clubDB.name).toEqual(mockClub.name);
    expect(clubDB.startBusinessDate).toEqual(mockClub.startBusinessDate);
    expect(clubDB.description).toEqual(mockClub.description);
    expect(clubDB.presentationImage).toEqual(mockClub.presentationImage);
  });

  it('update should return error caused by long description', async () => {
    const mockClub: ClubEntity = mockClubs[0];
    mockClub.name = 'New name';
    mockClub.description = faker.lorem.paragraph(8);

    await expect(() =>
      service.update(mockClub.id, mockClub),
    ).rejects.toHaveProperty('message', 'description is to long');
  });

  it('update should return error caused by long Presentation image', async () => {
    const mockClub: ClubEntity = mockClubs[0];
    mockClub.name = 'New name';
    mockClub.presentationImage = faker.lorem.paragraph(8);

    await expect(() =>
      service.update(mockClub.id, mockClub),
    ).rejects.toHaveProperty('message', 'Presentation image is to long');
  });

  it('update should return error caused by club id not found', async () => {
    const mockClub: ClubEntity = mockClubs[0];
    mockClub.name = 'New name';
    mockClub.presentationImage = faker.internet.url();

    await expect(() => service.update('0', mockClub)).rejects.toHaveProperty(
      'message',
      'Club not found',
    );
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = mockClubs[0];
    await service.delete(club.id);
    const deletedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(deletedClub).toBeNull();
  });

  it('delete should throw an exception for an invalid Club id', async () => {
    const club: ClubEntity = mockClubs[0];
    await service.delete(club.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'Club not found',
    );
  });
});
