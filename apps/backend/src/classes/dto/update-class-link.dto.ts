import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateClassLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
