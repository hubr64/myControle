import { Component, OnInit, DoCheck } from '@angular/core';
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
export class DevoirNotationComponent implements DoCheck, OnInit {

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

  ngDoCheck() {
    this.devoirService.doCheck();
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
  }

  addNotation(eleve) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'single';
    // @ts-ignore: Provide it the required eleve
    modalRef.componentInstance.eleve = eleve;
  }

  launchNotation() {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'multi';
  }

  deleteAllNotations() {
    if (confirm('Voulez-vous vraiment supprimer définitivement toutes les notations de ce devoir ? ')) {
      this.devoirService.devoir.notations = [];
    }
  }

}
