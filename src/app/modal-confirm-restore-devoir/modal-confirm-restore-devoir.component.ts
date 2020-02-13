import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from '../_services/message.service';
import { Devoir } from '../_models/devoir';

@Component({
  selector: 'app-modal-confirm-restore-devoir',
  templateUrl: './modal-confirm-restore-devoir.component.html',
  styleUrls: ['./modal-confirm-restore-devoir.component.sass']
})
export class ModalConfirmRestoreDevoirComponent implements OnInit {

  @Input() devoir;
  public devoirDetails = '';

  constructor(
    public messageService: MessageService,
    public modal: NgbActiveModal) {
  }
  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.devoir) {
      const tmp = JSON.parse(this.devoir);
      this.devoirDetails = tmp.data.general.titre + ' (Créé le : ' + new Date(tmp.meta.date_creation).toLocaleDateString() + ')';
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

}

