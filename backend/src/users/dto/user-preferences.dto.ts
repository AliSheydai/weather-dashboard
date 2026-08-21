import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['C', 'F'], { message: 'temperatureUnit must be either "C" or "F"' })
  temperatureUnit: 'C' | 'F';
}
