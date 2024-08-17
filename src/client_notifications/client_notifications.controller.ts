import {Body, Controller,Post } from '@nestjs/common';
import { ClientNotificationsService } from './client_notifications.service';
import { SendNotificationDto } from './dto/send_notification.dto';


@Controller('notifications')
export class ClientNotificationsController {
  constructor(
    private clientNotificationsService: ClientNotificationsService,
  ){}
  @Post('send')
  async sendNotification(@Body() notificationData: SendNotificationDto) {
    try {
      const result = await this.clientNotificationsService.sendNotification(notificationData);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
