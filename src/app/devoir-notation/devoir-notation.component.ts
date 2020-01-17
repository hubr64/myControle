import { Component, OnInit } from '@angular/core';
import { DevoirService } from '../_services/devoir.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-devoir-notation',
  templateUrl: './devoir-notation.component.html',
  styleUrls: ['./devoir-notation.component.sass']
})
export class DevoirNotationComponent implements OnInit {

  public noteStatusOkCoeff = 0;
  public noteStatusEnCoursCoeff = 0;
  public noteStatusKoCoeff = 0;
  public noteStatusOk = 0;
  public noteStatusEnCours = 0;
  public noteStatusKo = 0;
  public noteCoeffs = [];

  public orderList = '';
  public noteMode = '';

  constructor(
    private devoirService: DevoirService,
    private configurationService: ConfigurationService
  ) {
    this.noteStatusOkCoeff = this.configurationService.getValue('noteStatusOkCoeff');
    this.noteStatusEnCoursCoeff = this.configurationService.getValue('noteStatusEnCoursCoeff');
    this.noteStatusKoCoeff = this.configurationService.getValue('noteStatusKoCoeff');
    this.noteStatusOk = this.configurationService.getValue('noteStatusOk');
    this.noteStatusEnCours = this.configurationService.getValue('noteStatusEnCours');
    this.noteStatusKo = this.configurationService.getValue('noteStatusKo');

    this.noteCoeffs[this.noteStatusOk] = this.noteStatusOkCoeff;
    this.noteCoeffs[this.noteStatusEnCours] = this.noteStatusEnCoursCoeff;
    this.noteCoeffs[this.noteStatusKo] = this.noteStatusKoCoeff;

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
        a.getNote(this.noteCoeffs) > b.getNote(this.noteCoeffs) ? -1 : a.getNote(this.noteCoeffs) === b.getNote(this.noteCoeffs) ? 0 : 1
      );
    }
  }

}
