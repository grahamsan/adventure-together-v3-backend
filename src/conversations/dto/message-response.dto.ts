import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  attachments: string[];

  @ApiProperty({ nullable: true })
  senderName?: string;

  @ApiProperty({ nullable: true })
  senderAvatar?: string;

  @ApiProperty()
  readByUserIds: string[];
}
