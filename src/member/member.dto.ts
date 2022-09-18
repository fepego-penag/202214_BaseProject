import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsDate()
  @IsNotEmpty()
  dateBirth: Date;
}
