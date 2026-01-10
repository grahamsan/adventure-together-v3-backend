import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { storage } from '../../cloudinary.storage';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  @Post('single')
  @ApiOperation({ summary: 'Upload a single file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            public_id: { type: 'string' },
            original_name: { type: 'string' },
            size: { type: 'number' },
            mimetype: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or upload error.',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
    type: UnauthorizedResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return {
      url: file.path,
      public_id: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Files uploaded successfully.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              public_id: { type: 'string' },
              original_name: { type: 'string' },
              size: { type: 'number' },
              mimetype: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid files or upload error.',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
    type: UnauthorizedResponseDto,
  })
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }
}
