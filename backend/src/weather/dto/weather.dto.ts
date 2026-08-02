import { IsString, MinLength, MaxLength } from 'class-validator';

export class WeatherQueryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;
}
