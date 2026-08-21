import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Username must be between 2 and 50 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['C', 'F'], { message: 'temperatureUnit must be either "C" or "F"' })
  temperatureUnit?: 'C' | 'F';
}
