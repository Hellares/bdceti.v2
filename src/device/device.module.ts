import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Component } from 'src/component/entities/component.entity';
import { FilesService } from 'src/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Component])],
  controllers: [DeviceController],
  providers: [DeviceService, FilesService],
})
export class DeviceModule {}
