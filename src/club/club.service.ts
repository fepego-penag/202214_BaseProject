import { Injectable } from '@nestjs/common';
import { ClubEntity } from './club.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async findAll(): Promise<ClubEntity[]> {
    return await this.clubRepository.find({
      relations: ['members'],
    });
  }

  async findOne(id: string): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
      relations: ['members'],
    });
    if (!club)
      throw new BusinessLogicException(
        'Club not found',
        BusinessError.NOT_FOUND,
      );

    return club;
  }

  async create(club: ClubEntity): Promise<ClubEntity> {
    this.checkImageAndDescriptionLength(club);
    return await this.clubRepository.save(club);
  }

  async update(id: string, club: ClubEntity): Promise<ClubEntity> {
    this.checkImageAndDescriptionLength(club);
    const clubDb: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!clubDb)
      throw new BusinessLogicException(
        'Club not found',
        BusinessError.NOT_FOUND,
      );

    return await this.clubRepository.save({ ...clubDb, ...club });
  }

  async delete(id: string) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!club)
      throw new BusinessLogicException(
        'Club not found',
        BusinessError.NOT_FOUND,
      );

    await this.clubRepository.remove(club);
  }

  private checkImageAndDescriptionLength(club: ClubEntity) {
    if (!this.isvalidStringLength(club.presentationImage)) {
      throw new BusinessLogicException(
        'Presentation image is to long',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    if (!this.isvalidStringLength(club.description)) {
      throw new BusinessLogicException(
        'description is to long',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  }
  private isvalidStringLength(field: string): boolean {
    return field.length <= 100;
  }
}
