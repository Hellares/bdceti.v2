import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from './entities/support.entity';
import { Status } from 'src/status/entities/status.entity';
import { FilesService } from 'src/files/files.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Support, Status, User])],
  providers: [SupportService, FilesService],
  controllers: [SupportController]
})
export class SupportModule {}
