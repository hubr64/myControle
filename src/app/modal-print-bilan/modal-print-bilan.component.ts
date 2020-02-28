import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PrintService } from '../_services/print.service';

@Component({
  selector: 'app-modal-print-bilan',
  templateUrl: './modal-print-bilan.component.html',
  styleUrls: ['./modal-print-bilan.component.sass']
})
export class ModalPrintBilanComponent implements OnInit {

  public printNotesNotValidated: boolean;
  public printNotesBrutes: boolean;
  public printNotesBulletin: boolean;
  public printCommentaire: boolean;
  public printDevoirStatistiques: boolean;
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
    this.printCompetencesSummary = true;
  }

  ngOnInit() {
  }

  printBilan() {
    const options = [
      this.printNotesNotValidated,
      this.printNotesBrutes,
      this.printNotesBulletin,
      this.printCommentaire,
      this.printDevoirStatistiques,
      this.printCompetencesSummary
    ];
    this.printService.printDocument('bilan', options);
    this.modal.close('ok');
  }

}
