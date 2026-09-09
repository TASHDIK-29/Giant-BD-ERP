import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  poNumber: string;

  @IsInt()
  @Min(1)
  letterOfCreditId: number;
}