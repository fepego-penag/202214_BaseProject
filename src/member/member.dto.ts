import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  dateBirth: Date;
}
