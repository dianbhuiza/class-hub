import {
  IsString,
  IsUrl,
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClassLinkDto } from './create-class-link.dto';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClassLinkDto)
  links?: CreateClassLinkDto[];
}
