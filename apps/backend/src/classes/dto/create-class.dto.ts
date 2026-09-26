import {
  IsString,
  IsUrl,
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsUrl()
  url: string;

  @IsDateString()
  date: string;

  @IsArray()
  @IsString({ each: true })
  subjectIds: string[];

  @IsNumber()
  @IsOptional()
  week?: number;
}
