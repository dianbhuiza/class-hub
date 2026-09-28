import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSubjectFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;
}
