import { IsString, MinLength, MaxLength } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;
}
