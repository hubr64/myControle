import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import GrilleDefinition  from '../../assets/configuration/grilles.json';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from './message.service';
import { ConfigurationService } from './configuration.service';

import { Devoir } from '../_models/devoir';
import { Grille } from '../_models/grille';
import { Competence } from '../_models/competence';
import { Capacite } from '../_models/capacite';

import { ModalGridSelectionComponent } from '../modal-grid-selection/modal-grid-selection.component';

@Injectable({
  providedIn: 'root'
})
export class GrilleService {

  public grilles: any = GrilleDefinition.grilles;
  public grilleItems: any;
  public grilleStoragePrefix: string;
  public selectedCapaciteSub: Subject<any> = new Subject<any>();

  constructor(
    public messageService: MessageService,
    public configurationService: ConfigurationService,
    public modalService: NgbModal
  ) {
    // Compute local storage id that may store local configuration of grids
    this.grilleStoragePrefix = this.configurationService.getValue('storagePrefix') + 'grille-';

    // First convert configuration file into accepted JSON
    for (let [keyg, valueg] of Object.entries(this.grilles)) {
      for (let [keyComp, valueComp] of Object.entries(this.grilles[keyg].competences)) {
        let tmpCapacites = [];
        for (let [keyCap, valueCap] of Object.entries(this.grilles[keyg].competences[keyComp].capacites)) {
          tmpCapacites.push({
            id: keyCap,
            texte: valueCap
          });
        }
        this.grilles[keyg].competences[keyComp].capacites = tmpCapacites;
      }
    }

    // then get the configuration from the default file
    this.grilleItems = {};
    for (let [key, value] of Object.entries(this.grilles)) {
      this.grilleItems[key] = new Grille().deserialize(this.grilles[key]);
    }

    // Load local storage that replace the global initial storage
    this.load();
  }

  load() {
    for (let [key, value] of Object.entries(this.grilleItems)) {
      const tmpContent = localStorage.getItem(this.grilleStoragePrefix + key);
      if (tmpContent) {
        const tmpGrille = JSON.parse(tmpContent);
        this.grilleItems[key] = tmpGrille;
      }
    }
  }

  getGrille(id: any) {
    return this.grilleItems[id];
  }

  setGrille(id: any, newGrid: any) {
    if (this.grilleItems[id]) {
      this.grilleItems[id] = newGrid;
      localStorage.setItem(this.grilleStoragePrefix + id, JSON.stringify(newGrid));
    }
  }

  showGrille(selectedGrille?: Grille, canChooseCapacite?: boolean, devoir?: Devoir) {

    this.selectedCapaciteSub = new Subject<any>();

    // Display modal window to ask user for confirmation
    const modalRef = this.modalService.open(ModalGridSelectionComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide a grille if a devoir is configured with a grid
    modalRef.componentInstance.selectedgrille = selectedGrille;
    // @ts-ignore: Provide the ability to choose a capcity or not
    modalRef.componentInstance.canChooseCapacite = canChooseCapacite;
    // @ts-ignore: Provide this full list of grilles
    modalRef.componentInstance.grilles = this.grilleItems;
    if (devoir !== undefined) {
      // @ts-ignore: Provide this full list of grilles
      modalRef.componentInstance.devoir = devoir;
    }

    // Manage answer of the user
    modalRef.result.then((result) => {
      this.selectedCapaciteSub.next(result);
      this.selectedCapaciteSub.complete();
    }, (reason) => {
      // Remove is cancelled
      if (canChooseCapacite) {
        this.messageService.add('Aucune capacité sélectionnée.', 'warning', 'USER');
      }
    });
  }

  compareGrille(grille1: Grille, grille2: Grille): boolean {
    let grilleSame = true;
    if (grille1 && grille2) {
      if (grille1.titre !== grille2.titre) {
        grilleSame = false;
      } else {
        grille1.competences.forEach((competence, indexComp) => {
          if (grille1.competences[indexComp].titre !== grille2.competences[indexComp].titre
            || grille1.competences[indexComp].couleur !== grille2.competences[indexComp].couleur) {
            grilleSame = false;
          } else {
            competence.capacites.forEach((capacite, indexCapa) => {
              if (grille1.competences[indexComp].capacites[indexCapa].id !== grille2.competences[indexComp].capacites[indexCapa].id
                || grille1.competences[indexComp].capacites[indexCapa].texte !== grille2.competences[indexComp].capacites[indexCapa].texte) {
                grilleSame = false;
              }
            });
          }
        });
      }
    } else {
      grilleSame = false;
    }
    return grilleSame;
  }

  isAnExistingGrille(grilleToCheck: Grille): boolean {
    let grilleExisting = false;

    for (let [key, value] of Object.entries(this.grilleItems)) {
      const resCompare = this.compareGrille(this.grilleItems[key], grilleToCheck);
      if (resCompare === true) {
        grilleExisting = true;
        break;
      }
    }

    return grilleExisting;
  }

  diffCapacitesInGrilles(grille1: Grille, grille2: Grille): {capacite: Capacite, criteres: number}[] {

    let removedCapacites: {capacite: Capacite, criteres: number}[] = [];

    grille1.competences.forEach((competence, indexComp) => {
      competence.capacites.forEach((capa, indexCapa) => {
        const existingCapacite = grille2.getCapacite(capa.id);
        if (existingCapacite === null) {
          removedCapacites.push({
            capacite: capa,
            criteres: 0
          });
        }
      });
    });

    return removedCapacites;
  }

}
