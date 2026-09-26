import {
  IsString,
  IsUrl,
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjectIds?: string[];

  @IsNumber()
  @IsOptional()
  week?: number;
}
