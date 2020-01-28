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

  sortEleveBy(eleves) {
    if (this.orderList === 'nom') {
      return eleves.sort((a, b) =>
        a > b ? 1 : a === b ? 0 : -1
      );
    } else {
      return eleves.sort((a, b) => {
        if (this.devoirService.devoir.getEleveNotation(a) === null && this.devoirService.devoir.getEleveNotation(b) === null) {
          return 0;
        }
        if (this.devoirService.devoir.getEleveNotation(a) === null) {
          return 1;
        }
        if (this.devoirService.devoir.getEleveNotation(b) === null) {
          return -1;
        }
        if (this.devoirService.devoir.getEleveNotation(a).getNote() > this.devoirService.devoir.getEleveNotation(b).getNote()) {
          return -1;
        }
        if (this.devoirService.devoir.getEleveNotation(a).getNote() === this.devoirService.devoir.getEleveNotation(b).getNote()) {
          return 0;
        }
        if (this.devoirService.devoir.getEleveNotation(a).getNote() < this.devoirService.devoir.getEleveNotation(b).getNote()) {
          return 1;
        }
      });
    }
  }

  selectEleve(eleve: string) {
    const notation = this.devoirService.devoir.getEleveNotation(eleve);
    if (notation) {
      this.selectNotation(notation);
    } else {
      this.addNotation(eleve);
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
