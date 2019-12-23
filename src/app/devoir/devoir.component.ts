import { Component, OnInit, HostListener } from '@angular/core';

import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-devoir',
  templateUrl: './devoir.component.html',
  styleUrls: ['./devoir.component.sass']
})
export class DevoirComponent implements OnInit {

  // Function inserted to prevent user to close the window without saving the content
  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    if (this.devoirService.docIsEdited) {
      $event.preventDefault();
      $event.returnValue = `Vous souhaitez quitter la page alors que le devoir en cours n\'est pas sauvegardée.\n
      Voulez-vous vraiment continuer ?`;
      return $event;
    }
  }

  constructor(private devoirService: DevoirService, private messageService: MessageService) {
  }

  ngOnInit() {
  }

}
