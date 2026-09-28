import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateSubjectFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url?: string;
}
