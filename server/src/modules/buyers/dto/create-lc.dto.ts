import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLcDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lcNumber: string;

  @IsInt()
  @Min(1)
  buyerId: number;
}