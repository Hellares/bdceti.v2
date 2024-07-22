import { Module, Controller } from '@nestjs/common';
import { ComponentController } from './component.controller';
import { ComponentService } from './component.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Component } from './entities/component.entity';

@Module({
  imports: [ (TypeOrmModule.forFeature([Component])) ],
  providers: [ ComponentService],
  controllers: [ ComponentController]
})
export class ComponentModule {}
