import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DevoirService } from '../_services/devoir.service';
import { GrilleService } from '../_services/grille.service';
import { ClasseService } from '../_services/classe.service';
import { MessageService } from '../_services/message.service';
import { ConfigurationService } from '../_services/configuration.service';
import { ModalConfirmGridComponent } from '../modal-confirm-grid/modal-confirm-grid.component';
import { ModalConfirmClasseComponent } from '../modal-confirm-classe/modal-confirm-classe.component';

import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter, NgbDateParserFormatter, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
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

  public visible = false;

  public notationModeNormal;
  public notationModeProportionnel;
  public notationModeRapporte;
  public notationModeNormalTitre = 'Mode de notation';
  public notationModeNormalContent = 'Transformation de la note pour arriver à la note finale :';

  constructor(
    public devoirService: DevoirService,
    public grilleService: GrilleService,
    public classeService: ClasseService,
    public messageService: MessageService,
    public modalService: NgbModal,
    public config: NgbDropdownConfig,
    public configurationService: ConfigurationService) {
    this.notationModeNormal = this.configurationService.getValue('notationModeNormal');
    this.notationModeProportionnel = this.configurationService.getValue('notationModeProportionnel');
    this.notationModeRapporte = this.configurationService.getValue('notationModeRapporte');

    config.container = 'body';
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
      this.configurationService.getValue('notationModeArr').forEach((mode: any, index: any) => {
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

  grilleChanged(newGrille: any) {
    // No grille defined then can assigned a new one
    if (this.devoirService.devoir.grille === null) {
      this.devoirService.devoir.grille = newGrille;
    } else {
      // There was a grid defined and a new one is selected
      if (this.grilleService.compareGrille(this.devoirService.devoir.grille, newGrille) === false) {

        // Display modal window to ask user for confirmation
        const modalRef = this.modalService.open(ModalConfirmGridComponent, { centered: true, scrollable: true });
        // @ts-ignore: Provide it the required grille to apply (to display more information)
        modalRef.componentInstance.grilleConfirm = newGrille;

        // Manage answer of the user
        modalRef.result.then((result) => {
          this.devoirService.replaceGrille(newGrille);
        }, (reason) => {
          // Remove is cancelled
          this.messageService.add('Changement de grille annulé', 'warning', 'USER');
        });
      }
    }
  }

  toggleGrilleSelection() {
    this.grilleService.showGrille(this.devoirService.devoir.grille, false, this.devoirService.devoir);
  }

  classeChanged(newClasse: any) {
    // No classe defined then can assigned a new one
    if (this.devoirService.devoir.classe === null) {
      this.devoirService.devoir.classe = newClasse;
    } else {
      // There was a classe defined and a new one is selected
      if (this.classeService.compareClasse(this.devoirService.devoir.classe, newClasse) === false) {

        // Display modal window to ask user for confirmation
        const modalRef = this.modalService.open(ModalConfirmClasseComponent, { centered: true, scrollable: true });
        // @ts-ignore: Provide it the required classe to apply (to display more information)
        modalRef.componentInstance.classeConfirm = newClasse;

        // Manage answer of the user
        modalRef.result.then((result) => {
          this.devoirService.replaceClasse(newClasse);
        }, (reason) => {
          // Remove is cancelled
          this.messageService.add('Changement de classe annulé', 'warning', 'USER');
        });
      }
    }
  }

  toggleClasseSelection() {
    this.classeService.showClasse(this.devoirService.devoir.classe, false);
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
