import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from './message.service';
import { ConfigurationService } from './configuration.service';

import { Classe } from '../_models/classe';
import { ModalClasseSelectionComponent } from '../modal-classe-selection/modal-classe-selection.component';

@Injectable({
  providedIn: 'root'
})
export class ClasseService {

  public classeItems: any;
  public classeStoragePrefix: string;
  public selectedEleveSub: Subject<any> = new Subject<any>();

  constructor(
    public messageService: MessageService,
    public configurationService: ConfigurationService,
    public modalService: NgbModal,
    public http: HttpClient
  ) {
    // Compute local storage id that may store local configuration of classes
    this.classeStoragePrefix = this.configurationService.getValue('storagePrefix') + 'classe-';

    // Load configuration from CSV
    this.classeItems = [];
    this.http.get('assets/configuration/classes.csv', { responseType: 'text' })
      .subscribe(
        data => {
          if (data) {
            const rows = data.split('\r\n');
            for (const [i, row] of rows.entries()) {
              const cols = row.split(';');
              for (const [j, col] of cols.entries()) {
                if (i === 0) {
                  let currentClasse = new Classe();
                  currentClasse.id = '_' + col;
                  currentClasse.titre = col;
                  currentClasse.eleves = [];
                  this.classeItems.push(currentClasse);
                } else {
                  if (col.length > 0) {
                    this.classeItems[j].eleves.push(col);
                  }
                }
              }
            }
          }
          // Load local storage that replace the global initial storage
          this.load();
        },
        error => {
          this.messageService.add(error, 'danger', 'USER');
        }
      );
  }

  load() {
    for (const [i, classe] of this.classeItems.entries()) {
      const tmpContent = localStorage.getItem(this.classeStoragePrefix + classe.id);
      if (tmpContent) {
        const tmpClasse = JSON.parse(tmpContent);
        this.classeItems[i] = tmpClasse;
      }
    }
  }

  getClasse(id: any) {
    return this.classeItems[id];
  }

  setClasse(id: any, newClasse: any) {
    if (this.classeItems[id]) {
      this.classeItems[id] = newClasse;
      localStorage.setItem(this.classeStoragePrefix + newClasse.id, JSON.stringify(newClasse));
    }
  }

  showClasse(selectedClasse?: Classe, canChooseEleve?: boolean) {

    this.selectedEleveSub = new Subject<any>();

    // Display modal window to ask user for confirmation
    const modalRef = this.modalService.open(ModalClasseSelectionComponent, { centered: true, scrollable: true });
    //Provide a classe if a devoir is configured with a classe
    modalRef.componentInstance.selectedClasse = selectedClasse;
    //Provide the ability to choose a capcity or not
    modalRef.componentInstance.canChooseEleve = canChooseEleve;
    //Provide this full list of classe
    modalRef.componentInstance.classes = this.classeItems;

    // Manage answer of the user
    modalRef.result.then((result) => {
      this.selectedEleveSub.next(result);
      this.selectedEleveSub.complete();
    }, () => {
      // Remove is cancelled
      if (canChooseEleve) {
        this.messageService.add('Aucun élève sélectionnée.', 'warning', 'USER');
      }
    });
  }

  compareClasse(classe1: Classe, classe2: Classe): boolean {
    let classeSame = true;
    if (classe1 && classe2) {
      if (classe1.titre !== classe2.titre) {
        classeSame = false;
      } else {
        classe1.eleves.forEach((eleve, indexEleve) => {
          if (classe2.eleves.indexOf(eleve) === -1) {
            classeSame = false;
          }
        });
      }
    } else {
      classeSame = false;
    }
    return classeSame;
  }

  isAnExistingClasse(classeToCheck: Classe): boolean {
    let classeExisting = false;

    for (let [key, classe] of Object.entries(this.classeItems)) {
      const resCompare = this.compareClasse(this.classeItems[key], classeToCheck);
      if (resCompare === true) {
        classeExisting = true;
        break;
      }
    }

    return classeExisting;
  }

  diffElevesInClasses(classe1: Classe, classe2: Classe) {
    let removedEleves: any[] = [];
    classe1.eleves.forEach((curEleve, indexEleve) => {
      const existingEleve = classe2.eleves.indexOf(curEleve);
      if (existingEleve === -1) {
        removedEleves.push({
          eleve: curEleve,
          notation: false
        });
      }
    });

    return removedEleves;
  }

}
