import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  startBusinessDate: Date;

  @IsString()
  @IsNotEmpty()
  presentationImage: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
