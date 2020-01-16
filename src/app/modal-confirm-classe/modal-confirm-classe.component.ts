import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from '../_services/message.service';
import { DevoirService } from '../_services/devoir.service';
import { ClasseService } from '../_services/classe.service';
import { Classe } from '../_models/classe';

@Component({
  selector: 'app-modal-confirm-classe',
  templateUrl: './modal-confirm-classe.component.html',
  styleUrls: ['./modal-confirm-classe.component.sass']
})
export class ModalConfirmClasseComponent implements OnInit {

  @Input() classeConfirm: Classe;
  public removedEleves;

  constructor(
    private messageService: MessageService,
    private devoirService: DevoirService,
    private classeService: ClasseService,
    public modal: NgbActiveModal) {
    this.removedEleves = [];
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.classeConfirm && this.devoirService.devoir.classe) {
      this.removedEleves = this.classeService.diffElevesInClasses(this.devoirService.devoir.classe, this.classeConfirm);
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 1000);
    }
  }

}
