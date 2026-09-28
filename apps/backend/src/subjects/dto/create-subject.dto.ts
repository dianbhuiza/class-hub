import { IsString, IsUrl, ValidateIf } from 'class-validator';

const hasValue = (_: unknown, value: unknown) =>
  value !== undefined && value !== null && value !== '';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @ValidateIf(hasValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  img?: string;

  @ValidateIf(hasValue)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  materialsUrl?: string;
}
