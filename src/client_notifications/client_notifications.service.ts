import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseRepository } from 'src/firebase/firebase.repository';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SendNotificationDto } from './dto/send_notification.dto';

@Injectable()
export class ClientNotificationsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private firebaseRepository: FirebaseRepository,
  ){}
  async sendNotification(notificationData: SendNotificationDto) {
    const { idUser, title, body, additionalData } = notificationData;

    const user = await this.userRepository.findOne({
      where: { id: idUser },
      select: ['id', 'notification_token']
    });

    if (!user || !user.notification_token) {
      throw new Error('Usuario no encontrado o sin token de notificación');
    }

    try {
      await this.firebaseRepository.sendMessage({
        token: user.notification_token,
        notification: { title, body },
        data: {
          idUser: `${idUser}`,
          title,
          body,
          ...additionalData,
        },
        android: {
          ttl: 180,
          priority: 'high',
        },
      });
      return { success: true, message: 'Notificación enviada exitosamente' };
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      throw new Error('Error al enviar la notificación');
    }
  }  
}
