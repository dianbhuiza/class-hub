import { IsString, IsOptional, IsUrl, ValidateIf } from 'class-validator';

const hasValue = (_: unknown, value: unknown) =>
  value !== undefined && value !== null && value !== '';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @ValidateIf(hasValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  img?: string | null;
}
