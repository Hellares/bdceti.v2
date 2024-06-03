import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryProvider } from './cloudinary/files.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [FilesService, CloudinaryProvider],
  imports: [ConfigModule]
})
export class FilesModule {}
