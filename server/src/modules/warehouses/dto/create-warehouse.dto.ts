import {
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';


export class CreateWarehouseDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;


    @IsString()
    @MinLength(2)
    @MaxLength(50)
    code: string;


    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}