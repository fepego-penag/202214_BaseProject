import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberService)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async findAll(): Promise<MemberEntity[]> {
    return await this.memberRepository.find({
      relations: ['clubs'],
    });
  }

  async findOne(id: string): Promise<MemberEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id },
      relations: ['clubs'],
    });
    if (!member)
      throw new BusinessLogicException(
        'Member not found',
        BusinessError.NOT_FOUND,
      );

    return member;
  }

  async create(member: MemberEntity): Promise<MemberEntity> {
    if (!this.emailValidation(member.email)) {
      throw new BusinessLogicException(
        'Email is not valid',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return await this.memberRepository.save(member);
  }

  async update(id: string, member: MemberEntity): Promise<MemberEntity> {
    if (!this.emailValidation(member.email)) {
      throw new BusinessLogicException(
        'Email is not valid',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    const memberDB: MemberEntity = await this.memberRepository.findOne({
      where: { id },
    });
    if (!memberDB)
      throw new BusinessLogicException(
        'Member not found',
        BusinessError.NOT_FOUND,
      );

    return await this.memberRepository.save({ ...memberDB, ...member });
  }

  async delete(id: string) {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id },
    });
    if (!member)
      throw new BusinessLogicException(
        'Member not found',
        BusinessError.NOT_FOUND,
      );

    await this.memberRepository.remove(member);
  }

  private emailValidation(email: string): boolean {
    let isValid = false;
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

    isValid = regexp.test(email);
    return isValid;
  }
}
