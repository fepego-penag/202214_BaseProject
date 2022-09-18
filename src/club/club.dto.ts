import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startBusinessDate: Date;

  @IsString()
  @IsNotEmpty()
  presentationImage: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
