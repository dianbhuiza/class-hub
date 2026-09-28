import {
  IsString,
  IsUrl,
  ValidateIf,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubjectFileDto } from './create-subject-file.dto';

const hasValue = (_: unknown, value: unknown) =>
  value !== undefined && value !== null && value !== '';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @ValidateIf(hasValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  img?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectFileDto)
  files?: CreateSubjectFileDto[];
}
