import { Component, OnInit, HostListener } from '@angular/core';

import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-devoir',
  templateUrl: './devoir.component.html',
  styleUrls: ['./devoir.component.sass']
})
export class DevoirComponent implements OnInit {

  public mode = '';

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

  constructor(
    public devoirService: DevoirService,
    public configurationService: ConfigurationService,
    public messageService: MessageService
  ) {
    this.mode = this.configurationService.getValue('defaultMode');
  }

  ngOnInit() {
  }

  toggleMode(newMode: string) {
    this.mode = newMode;
  }

}
