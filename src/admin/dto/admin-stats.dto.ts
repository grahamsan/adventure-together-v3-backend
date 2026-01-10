import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardStatsDto {
  @ApiProperty()
  totalExperiences: number;

  @ApiProperty()
  totalTrips: number;

  @ApiProperty()
  totalComments: number;

  @ApiProperty()
  totalReports: number;

  @ApiProperty()
  tripStats: {
    last30Days: number;
    last60Days: number;
    last90Days: number;
  };

  @ApiProperty()
  likesPerExperience: {
    experienceId: string;
    title: string;
    likes: number;
  }[];
}
