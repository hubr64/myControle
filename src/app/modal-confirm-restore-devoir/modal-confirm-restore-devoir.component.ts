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

  @Input() devoir: string = '';
  @Input() devoirDate: string = '';
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
      const tmpDate = new Date(JSON.parse(this.devoirDate));
      this.devoirDetails = '<p><strong>' + tmp.data.general.titre + '</strong></p><p>Enregistré automatiquement à <b>' + tmpDate.toLocaleString() + '</b></p>';
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

}

