import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public messageDuration;
  messagesUser: any[] = [];
  messagesDev: any[] = [];

  constructor(
    public configurationService: ConfigurationService
  ) {
    this.messageDuration = parseInt(this.configurationService.getValue('messageDuration'), 10);
  }

  add(msgText: string, msgType: string, context: string) {

    // Message creation
    const msg = {
      text: msgText,
      type: msgType,
      date: new Date()
    };
    // Create a subscription to remove it automaticcaly after a certain time
    let msgSub = new Subject<any>();
    msgSub.pipe(
      debounceTime(this.messageDuration)
    ).subscribe((msgToPop) => {
      this.messagesUser.forEach((message, indexMessage) => {
        if (message === msgToPop) {
          this.messagesUser.splice(indexMessage, 1);
        }
      });
      this.messagesDev.forEach((message, indexMessage) => {
        if (message === msgToPop) {
          this.messagesDev.splice(indexMessage, 1);
        }
      });
    });
    // Begin subscription
    msgSub.next(msg);

    // Store it in right place
    if (context === 'USER') {
      this.messagesUser.push(msg);
    }
    if (context === 'DEV') {
      this.messagesDev.push(msg);
    }
  }

  // Clear a full list
  clear(context: string) {
    if (context === 'USER') {
      this.messagesUser = [];
    }
    if (context === 'DEV') {
      this.messagesDev = [];
    }
  }

  // Remove a message from the list
  close(msg) {
    this.messagesUser.forEach((message, indexMessage) => {
      if (message === msg) {
        this.messagesUser.splice(indexMessage, 1);
      }
    });
    this.messagesDev.forEach((message, indexMessage) => {
      if (message === msg) {
        this.messagesDev.splice(indexMessage, 1);
      }
    });
  }
}
