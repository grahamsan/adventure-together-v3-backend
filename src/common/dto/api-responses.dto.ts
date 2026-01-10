import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error?: string;
}

export class BadRequestResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 400 })
  declare statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  declare message: string | string[];
}

export class UnauthorizedResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 401 })
  declare statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  declare message: string;
}

export class ForbiddenResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 403 })
  declare statusCode: number;

  @ApiProperty({ example: 'Forbidden' })
  declare message: string;
}

export class NotFoundResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 404 })
  declare statusCode: number;

  @ApiProperty({ example: 'Not Found' })
  declare message: string;
}

export class ConflictResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 409 })
  declare statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  declare message: string;
}

export class SuccessResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  data: T;
}
