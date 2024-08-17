import { Inject, Injectable } from '@nestjs/common';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
  private messaging: admin.messaging.Messaging;
  
  constructor(@Inject('FIREBASE_APP') private firebaseApp: admin.app.App ) {
    this.messaging = firebaseApp.messaging();
  }

  async sendMessage(notification: Message){
    // this.messaging.send(notification).then((response) => {
    // }).catch(e => {
    //     console.log('ERROR ENVIANDO NOTIFICACION: ', e);
    // })
    try {
      const response = await this.messaging.send(notification);
      //console.log('NOTIFICACION ENVIADA');
      return response;
    } catch (e) {
      console.log('ERROR ENVIANDO NOTIFICACION: ', e);
      throw e;
    }
  }

  // sendMessageToMultipleDevices(notification: MulticastMessage) {
  //   this.messaging.sendEachForMulticast(notification).then((response) => {
  //       console.log('NOTIFICACION ENVIADA');
  //   }).catch(e => {
  //       console.log('ERROR ENVIANDO NOTIFICACION: ', e);
  //   })
  // }
}