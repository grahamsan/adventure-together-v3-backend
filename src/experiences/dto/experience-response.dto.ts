import { ApiProperty } from '@nestjs/swagger';

export class ExperienceOwnerDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class ExperienceStatsDto {
  @ApiProperty()
  interests: number;

  @ApiProperty()
  comments: number;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  hasLiked: boolean;

  @ApiProperty()
  trips: number;
}

export class ExperienceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  image: string;

  @ApiProperty({ type: ExperienceOwnerDto })
  owner: ExperienceOwnerDto;

  @ApiProperty({ type: ExperienceStatsDto })
  stats: ExperienceStatsDto;
}

export class ExperienceFeedResponseDto {
  @ApiProperty({ type: [ExperienceResponseDto] })
  data: ExperienceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
