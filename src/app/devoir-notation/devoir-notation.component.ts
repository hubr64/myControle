import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DevoirService } from '../_services/devoir.service';
import { Notation } from '../_models/notation';
import { ConfigurationService } from '../_services/configuration.service';
import { ModalEleveNotationComponent } from '../modal-eleve-notation/modal-eleve-notation.component';

@Component({
  selector: 'app-devoir-notation',
  templateUrl: './devoir-notation.component.html',
  styleUrls: ['./devoir-notation.component.sass']
})
export class DevoirNotationComponent implements OnInit {

  public orderList = '';
  public noteMode = '';

  constructor(
    private devoirService: DevoirService,
    private configurationService: ConfigurationService,
    private modalService: NgbModal
  ) {
    this.orderList = this.configurationService.getValue('notationDefaultOrder');
    this.noteMode = this.configurationService.getValue('notationDefaultNoteMode');
  }

  ngOnInit() {
  }

  sortNotationby() {
    if (this.orderList === 'nom') {
      return this.devoirService.devoir.notations.sort((a, b) =>
        a.eleve > b.eleve ? 1 : a.eleve === b.eleve ? 0 : -1
      );
    } else {
      return this.devoirService.devoir.notations.sort((a, b) =>
        a.getNote() > b.getNote() ? -1 : a.getNote() === b.getNote() ? 0 : 1
      );
    }
  }

  selectNotation(notation: Notation) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation
    modalRef.componentInstance.notation = notation;
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'single';

    // Manage answer of the user
    modalRef.result.then((result) => {

    }, (reason) => {

    });
  }

}
