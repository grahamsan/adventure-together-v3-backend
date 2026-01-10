import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Ceci est mon commentaire modifié.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
