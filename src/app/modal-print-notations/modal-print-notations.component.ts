import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PrintService } from '../_services/print.service';

@Component({
  selector: 'app-modal-print-notations',
  templateUrl: './modal-print-notations.component.html',
  styleUrls: ['./modal-print-notations.component.sass']
})
export class ModalPrintNotationsComponent implements OnInit {

  public printNotesNotValidated: boolean;
  public printNotesBrutes: boolean;
  public printNotesBulletin: boolean;
  public printCommentaire: boolean;
  public printDevoirStatistiques: boolean;
  public printExerciceSummary: boolean;
  public printCompetencesSummary: boolean;


  constructor(
    public modal: NgbActiveModal,
    public printService: PrintService
  ) {
    this.printNotesNotValidated = false;
    this.printNotesBrutes = true;
    this.printNotesBulletin = true;
    this.printCommentaire = true;
    this.printDevoirStatistiques = true;
    this.printExerciceSummary = false;
    this.printCompetencesSummary = true;
  }

  ngOnInit() {
  }

  printNotations() {
    const options = [
      this.printNotesNotValidated,
      this.printNotesBrutes,
      this.printNotesBulletin,
      this.printCommentaire,
      this.printDevoirStatistiques,
      this.printExerciceSummary,
      this.printCompetencesSummary
    ];
    this.printService.printDocument('notations', options);
    this.modal.close('ok');
  }

}
