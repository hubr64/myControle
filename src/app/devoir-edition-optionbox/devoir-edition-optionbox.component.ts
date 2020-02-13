import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';
import { ClipboardService } from '../_services/clipboard.service';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { ModalMoveComponent } from '../modal-move/modal-move.component';

import { Exercice } from '../_models/exercice';
import { Freetext } from '../_models/freetext';
import { Question } from '../_models/question';
import { Critere } from '../_models/critere';

@Component({
  selector: 'app-devoir-edition-optionbox',
  templateUrl: './devoir-edition-optionbox.component.html',
  styleUrls: ['./devoir-edition-optionbox.component.sass']
})
export class DevoirEditionOptionboxComponent implements OnInit {

  @Input() public itemType;
  @Input() public item;

  constructor(
    public devoirService: DevoirService,
    public messageService: MessageService,
    public clipboardService: ClipboardService,
    public modalService: NgbModal) { }

  ngOnInit() {
  }

  copyItem(item: any) {
    // Get JSON string of the item (whatever the item : exercice, question, ...)
    const itemContent = item.serialize();
    // Transfer it to the clipboard service
    this.clipboardService.copy(itemContent);
  }

  moveUpItem(item: any) {
    this.shiftItem(item, -1);
  }
  moveDownItem(item: any) {
    this.shiftItem(item, 1);
  }

  shiftItem(item: any, shiftSize: number) {

    let tempItem = null;

    for (const [indexExe, exercice] of this.devoirService.devoir.exercices.entries()) {
      if (exercice === item) {
        if (shiftSize > 0 && indexExe + shiftSize <= this.devoirService.devoir.exercices.length - 1 ||
          shiftSize < 0 && indexExe + shiftSize >= 0) {
          tempItem = this.devoirService.devoir.exercices[indexExe + shiftSize].serialize();
          this.devoirService.devoir.exercices[indexExe + shiftSize] = item;
          if (tempItem.type === 'exe') {
            this.devoirService.devoir.exercices[indexExe] = new Exercice().deserialize(tempItem);
          } else {
            this.devoirService.devoir.exercices[indexExe] = new Freetext().deserialize(tempItem);
          }
        }
        break;
      } else if (this.devoirService.devoir.exercices[indexExe].questions) {
        for (const [indexQue, question] of this.devoirService.devoir.exercices[indexExe].questions.entries()) {
          if (question === item) {
            if (shiftSize > 0 && indexQue + shiftSize <= this.devoirService.devoir.exercices[indexExe].questions.length - 1 ||
              shiftSize < 0 && indexQue + shiftSize >= 0) {
              tempItem = this.devoirService.devoir.exercices[indexExe].questions[indexQue + shiftSize].serialize();
              this.devoirService.devoir.exercices[indexExe].questions[indexQue + shiftSize] = item;
              if (tempItem.type === 'que') {
                this.devoirService.devoir.exercices[indexExe].questions[indexQue] = new Question().deserialize(tempItem);
              } else {
                this.devoirService.devoir.exercices[indexExe].questions[indexQue] = new Freetext().deserialize(tempItem);
              }
            }
            break;
          } else if (this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres) {
            for (const [indexCri, critere] of this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.entries()) {
              if (critere === item) {
                if (shiftSize > 0
                  && indexCri + shiftSize <= this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.length - 1 ||
                  shiftSize < 0 && indexCri + shiftSize >= 0) {
                  tempItem = this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres[indexCri + shiftSize].serialize();
                  this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres[indexCri + shiftSize] = item;
                  if (tempItem.type === 'cri') {
                    this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres[indexCri] =
                      new Critere().deserialize(tempItem);
                  } else {
                    this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres[indexCri] =
                      new Freetext().deserialize(tempItem);
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
  }

  deleteConfirmItem(item) {
    // If user confirms thus look for the item to be removed
    for (const [indexExe, exercice] of this.devoirService.devoir.exercices.entries()) {
      if (exercice.id === item.id) {
        // Remove exercise if this the requested item
        this.devoirService.devoir.exercices.splice(indexExe, 1);
        break;
      } else if (this.devoirService.devoir.exercices[indexExe].questions) {
        for (const [indexQue, question] of this.devoirService.devoir.exercices[indexExe].questions.entries()) {
          if (question.id === item.id) {
            // Remove question if this the requested item
            this.devoirService.devoir.exercices[indexExe].questions.splice(indexQue, 1);
            break;
          } else if (this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres) {
            for (const [indexCri, critere] of this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.entries()) {
              // Remove critere if this the requested item
              if (critere.id === item.id) {
                this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.splice(indexCri, 1);
                break;
              }
            }
          }
        }
      }
    }
  }

  deleteItem(item) {

    // Display modal window to ask user for confirmation
    const modalRef = this.modalService.open(ModalConfirmComponent, { centered: true });
    // @ts-ignore: Provide it the required item to delete (to display more information)
    modalRef.componentInstance.itemConfirm = item;

    // Manage answer of the user
    modalRef.result.then((result) => {
      // Remove the item
      this.deleteConfirmItem(item);
      // Remove is now finished then display a confirmation
      this.messageService.add('Suppression terminée', 'success', 'USER');
    }, (reason) => {
      // Remove is cancelled
      this.messageService.add('Suppression annulée', 'warning', 'USER');
    });
  }

  moveItem(item: any) {
    // Display modal window to ask user for confirmation
    const modalRef = this.modalService.open(ModalMoveComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide it the required item to delete (to display more information)
    modalRef.componentInstance.item = item;

    // Manage answer of the user
    modalRef.result.then((result) => {

      const selectedItem = result.item;
      const selectedPosition = result.position;

      // Directly remove without conformation
      this.deleteConfirmItem(item);

      // On ajoute tout à la fin
      if (selectedItem === null && selectedPosition === 'end') {
        this.devoirService.devoir.exercices.push(item);
      } else {
        // On ajoute pas tout à la fin
        for (const [indexExe, exercice] of this.devoirService.devoir.exercices.entries()) {
          if (exercice.id === selectedItem.id && selectedPosition === 'before') {
            // On insère avant l'identifiant fourni
            this.devoirService.devoir.exercices.splice(indexExe, 0, item);
            break;
          } else if (exercice.id === selectedItem.id && selectedPosition === 'end') {
            // Si on veut ajouter à la fin de l'exercice
            this.devoirService.devoir.exercices[indexExe].questions.push(item);
            break;
          } else if (this.devoirService.devoir.exercices[indexExe].questions) {
            for (const [indexQue, question] of this.devoirService.devoir.exercices[indexExe].questions.entries()) {
              if (question.id === selectedItem.id && selectedPosition === 'before') {
                // On insère avant l'identifiant fourni
                this.devoirService.devoir.exercices[indexExe].questions.splice(indexQue, 0, item);
                break;
              } else if (question.id === selectedItem.id && selectedPosition === 'end') {
                // Si on veut ajouter à la fin de la question
                this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.push(item);
              } else if (this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres) {
                for (const [indexCri, critere] of this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.entries()) {
                  if (critere.id === selectedItem.id) {
                    // Critère de référence trouvé : on mémorise sa position
                    this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.splice(indexCri, 0, item);
                    break;
                  }
                }
              }
            }
          }
        }
      }

      // Remove is now finished then display a confirmation
      this.messageService.add('Déplacement terminé', 'success', 'USER');
    }, (reason) => {
      // Remove is cancelled
      this.messageService.add('Déplacement annulé', 'warning', 'USER');
    });
  }

}
