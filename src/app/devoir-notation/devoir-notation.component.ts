import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';

import { DevoirService } from '../_services/devoir.service';
import { Notation } from '../_models/notation';
import { Groupe } from '../_models/groupe';
import { Capacite } from '../_models/capacite';
import { ConfigurationService } from '../_services/configuration.service';
import { ModalEleveNotationComponent } from '../modal-eleve-notation/modal-eleve-notation.component';
import { ModalEditGroupComponent } from '../modal-edit-group/modal-edit-group.component';

@Component({
  selector: 'app-devoir-notation',
  templateUrl: './devoir-notation.component.html',
  styleUrls: ['./devoir-notation.component.sass']
})
export class DevoirNotationComponent implements OnInit {

  public orderList = '';
  public noteMode = '';

  constructor(
    public devoirService: DevoirService,
    public configurationService: ConfigurationService,
    public modalService: NgbModal,
    config: NgbProgressbarConfig
  ) {
    this.orderList = this.configurationService.getValue('notationDefaultOrder');
    this.noteMode = this.configurationService.getValue('notationDefaultNoteMode');

    config.height = '20px';
    config.striped = true;
    config.animated = true;
  }

  ngOnInit() {
  }

  sortEleveBy(eleves: any[]) {
    if (this.orderList === 'nom') {
      return eleves.sort((a: any, b: any) =>
        a > b ? 1 : a === b ? 0 : -1
      );
    } else {
      return eleves.sort((a: string, b: string) => {
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
        return 0
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

  selectGroupe(groupe: Groupe) {
    const notation = this.devoirService.devoir.getEleveNotation(groupe.nom);
    if (notation) {
      this.selectNotation(notation, groupe);
    } else {
      this.addNotationForGroupe(groupe);
    }
  }

  selectNotation(notation: Notation, groupe: Groupe|null = null) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation
    modalRef.componentInstance.notation = notation;
    // Si c'est un groupe alors il faut donner le groupe à traiter
    if (groupe !== null) {
      // @ts-ignore: Provide it the required groupe
      modalRef.componentInstance.groupe = groupe;
    }
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'single';
  }

  addNotation(eleve: string) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'single';
    // @ts-ignore: Provide it the required eleve
    modalRef.componentInstance.eleve = eleve;
  }

  addNotationForGroupe(groupe: Groupe) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEleveNotationComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required notation mode
    modalRef.componentInstance.notationMode = 'single';
    // @ts-ignore: Provide it the required groupe
    modalRef.componentInstance.groupe = groupe;
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

  addGroupe() {
    // Display modal window
    const modalRef = this.modalService.open(ModalEditGroupComponent, { centered: true, scrollable: true });
    // @ts-ignore: indicate that loading is finished
    modalRef.componentInstance.selectedGroupe = true;
  }

  editGroupe(groupe: any) {
    // Display modal window
    const modalRef = this.modalService.open(ModalEditGroupComponent, { centered: true, scrollable: true });
    // @ts-ignore: provide group
    modalRef.componentInstance.groupe = groupe;
    // @ts-ignore: indicate that loading is finished
    modalRef.componentInstance.selectedGroupe = true;
  }

  getGlobalProgressValue() {

    let progressValue = 0;
    for (const exercice of this.devoirService.devoir.exercices) {
      if (exercice.questions) {
        for (const question of exercice.questions) {
          if (question.criteres) {
            for (const critere of question.criteres) {
              if (critere.className === 'Critere') {
                progressValue++;
              }
            }
          }
        }
      }
    }
    progressValue = progressValue * this.devoirService.devoir.classe.eleves.length;

    let realisedValue = 0;
    for (const notation of this.devoirService.devoir.notations) {
      if (this.devoirService.devoir.isGroupe(notation.eleve) === false) {
        realisedValue += notation.notes.length;
      }
    }

    progressValue = Math.round((realisedValue / progressValue) * 100);
    return progressValue;
  }

  getGlobalProgressStatus() {
    const progress = this.getGlobalProgressValue();

    if (progress < 25) {
      return 'danger';
    } else if (progress >= 25 && progress < 50) {
      return 'warning';
    } else if (progress >= 50 && progress < 75) {
      return 'info';
    } else {
      return 'success';
    }
  }

  getUsedCapacites(): any[] {
    let usedCapacites = this.devoirService.devoir.getCapaciteBilan();
    return usedCapacites;
  }

}
