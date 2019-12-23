import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';
import { ConfigurationService } from '../_services/configuration.service';

import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from '../_helpers/dateformat';

@Component({
  selector: 'app-generalites',
  templateUrl: './generalites.component.html',
  styleUrls: ['./generalites.component.sass'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
  { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class GeneralitesComponent implements OnInit {

  private visible = false;

  public notationModeNormal;
  public notationModeProportionnel;
  public notationModeRapporte;
  public notationModeNormalTitre = 'Mode de notation';
  public notationModeNormalContent = 'Transformation de la note pour arriver à la note finale :';

  constructor(
    private devoirService: DevoirService,
    private messageService: MessageService,
    private configurationService: ConfigurationService) {
    this.notationModeNormal = this.configurationService.getValue('notationModeNormal');
    this.notationModeProportionnel = this.configurationService.getValue('notationModeProportionnel');
    this.notationModeRapporte = this.configurationService.getValue('notationModeRapporte');
  }

  ngOnInit() {
    this.visible = false;
  }

  // Change visibility of main menu
  toggleVisibility() {
    this.visible = !this.visible;
  }

  toggleNotationMode() {
    if (this.devoirService.devoir.notationMode) {
      this.configurationService.getValue('notationModeArr').forEach((mode, index) => {
        if (this.devoirService.devoir.notationMode === mode.id) {
          this.notationModeNormalTitre = 'Mode de notation : ' + mode.titre;
          this.notationModeNormalContent = mode.description;
        }
      });
    } else {
      this.notationModeNormalTitre = 'Mode de notation';
      this.notationModeNormalContent = 'Transformation de la note pour arriver à la note finale :';
    }
  }

  get today() {
    return new Date();
  }

  checkArrondi(event: any) { // without type info
    if (this.devoirService.devoir.arrondi === 0) {
      this.messageService.add('L\'arrondi ne peut pas être égal à 0 !', 'warning', 'USER');
    }
  }

}
