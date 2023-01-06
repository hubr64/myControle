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

  @Input() classeConfirm: Classe|null = null;
  public removedEleves: any[];
  public impactedNotations: any[];

  constructor(
    public messageService: MessageService,
    public devoirService: DevoirService,
    public classeService: ClasseService,
    public modal: NgbActiveModal) {
    this.removedEleves = [];
    this.impactedNotations = [];
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.classeConfirm && this.devoirService.devoir.classe) {
      this.removedEleves = this.classeService.diffElevesInClasses(this.devoirService.devoir.classe, this.classeConfirm);
      this.impactedNotations = this.devoirService.getImpactedNotations(this.removedEleves);
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 1000);
    }
  }

}
