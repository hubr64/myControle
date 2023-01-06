import { Component, OnInit } from '@angular/core';
import { MessageService, MessageType } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.sass']
})
export class MessagesComponent implements OnInit {

  constructor(public messageService: MessageService) { }

  ngOnInit() {
  }

  close(message: MessageType) {
    this.messageService.close(message);
  }

}
