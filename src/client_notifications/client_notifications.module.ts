import { Module } from '@nestjs/common';
import { ClientNotificationsController } from './client_notifications.controller';
import { ClientNotificationsService } from './client_notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FirebaseRepository } from 'src/firebase/firebase.repository';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FirebaseModule,],
  controllers: [ClientNotificationsController],
  providers: [FirebaseRepository,ClientNotificationsService]
  
})
export class ClientNotificationsModule {}
