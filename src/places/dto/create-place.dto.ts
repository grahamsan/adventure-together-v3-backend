import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceType } from '../../common/enums';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Tour Eiffel' })
  @IsString()
  title: string;

  @ApiProperty({ enum: PlaceType, example: PlaceType.MONUMENT })
  @IsEnum(PlaceType)
  type: PlaceType;

  @ApiProperty({ example: 'Un monument historique iconique de Paris.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/eiffel.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}
