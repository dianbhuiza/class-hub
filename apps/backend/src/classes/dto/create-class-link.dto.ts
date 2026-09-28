import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateClassLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
