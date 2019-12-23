import { Component, OnInit, Input } from '@angular/core';
import { v4 as uuid } from 'uuid';

import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';
import { ClipboardService } from '../_services/clipboard.service';
import { ConfigurationService } from '../_services/configuration.service';

import { Exercice } from '../_models/exercice';
import { Freetext } from '../_models/freetext';
import { Question } from '../_models/question';
import { Critere } from '../_models/critere';

@Component({
  selector: 'app-devoir-edition-toolbox',
  templateUrl: './devoir-edition-toolbox.component.html',
  styleUrls: ['./devoir-edition-toolbox.component.sass']
})
export class DevoirEditionToolboxComponent implements OnInit {

  @Input() public itemType;
  @Input() public exeId;
  @Input() public queId;
  @Input() public criId;

  itemTextConversion = {
    exercice: 'un exercice',
    critere: 'un critère',
    question: 'une question'
  };

  constructor(
    private devoirService: DevoirService,
    private clipboardService: ClipboardService,
    private messageService: MessageService,
    private configurationService: ConfigurationService) { }

  ngOnInit() {
  }

  addItem(itemType: string, idExe: string, idQue: string, idCri: string, itemValue?: any) {
    if (itemType === 'exercice') {
      this.additemExercice(idExe, itemValue);
    }
    if (itemType === 'question') {
      this.additemQuestion(idExe, idQue, itemValue);
    }
    if (itemType === 'critere') {
      this.additemCritere(idExe, idQue, idCri, itemValue);
    }
    if (itemType === 'freetext') {
      this.additemFreetext(idExe, idQue, idCri, itemValue);
    }
  }

  additemExercice(idExe: string, itemValue?: any) {
    const newExercice = new Exercice();
    newExercice.id = itemValue ? itemValue.id : uuid();
    newExercice.title = itemValue ? itemValue.title : this.configurationService.getValue('exerciceTitreDefaut');
    newExercice.questions = itemValue ? itemValue.questions : [];

    if (idExe !== 'end') {
      let idPos = 0;
      this.devoirService.devoir.exercices.forEach((exercice, index) => {
        if (exercice.id === idExe) {
          idPos = index;
        }
      });
      this.devoirService.devoir.exercices.splice(idPos, 0, newExercice);
    } else {
      this.devoirService.devoir.exercices.push(newExercice);
    }

    const nbQue = parseInt(this.configurationService.getValue('exerciceNbQuestionDefaut'), 10);
    for (let i = 0; i < nbQue; i++) {
      this.additemQuestion(newExercice.id, 'end');
    }
  }

  additemQuestion(idExe: string, idQue: string, itemValue?: any) {
    const newQuestion = new Question();
    newQuestion.id = itemValue ? itemValue.id : uuid();
    newQuestion.title = itemValue ? itemValue.title : this.configurationService.getValue('questionTitreDefaut');
    newQuestion.criteres = itemValue ? itemValue.criteres : [];

    if (idExe !== null) {
      this.devoirService.devoir.exercices.forEach((exercice, indexExe) => {
        if (exercice.id === idExe) {
          if (idQue !== 'end') {
            let idPos = 0;
            this.devoirService.devoir.exercices[indexExe].questions.forEach((question, indexQue) => {
              if (question.id === idQue) {
                idPos = indexQue;
              }
            });
            this.devoirService.devoir.exercices[indexExe].questions.splice(idPos, 0, newQuestion);
          } else {
            this.devoirService.devoir.exercices[indexExe].questions.push(newQuestion);
          }
        }
      });
    }

    const nbCri = parseInt(this.configurationService.getValue('questionNbCritereDefaut'), 10);
    for (let i = 0; i < nbCri; i++) {
      this.additemCritere(idExe, newQuestion.id, 'end');
    }
  }

  additemCritere(idExe: string, idQue: string, idCri: string, itemValue?: any) {
    const newCritere = new Critere();
    newCritere.id = itemValue ? itemValue.id : uuid();
    newCritere.text = itemValue ? itemValue.text : this.configurationService.getValue('critereTitreDefaut');
    newCritere.bareme = itemValue ? itemValue.bareme : parseFloat(this.configurationService.getValue('critereBaremeDefaut'));
    newCritere.capacite = itemValue ? itemValue.capacite : null; // CONFIG

    if (idExe !== null && idQue !== null) {
      this.devoirService.devoir.exercices.forEach((exercice, indexExe) => {
        if (exercice.id === idExe) {
          this.devoirService.devoir.exercices[indexExe].questions.forEach((question, indexQue) => {
            if (question.id === idQue) {
              if (idCri !== 'end') {
                let idPos = 0;
                this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.forEach((critere, indexCri) => {
                  if (critere.id === idCri) {
                    idPos = indexCri;
                  }
                });
                this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.splice(idPos, 0, newCritere);
              } else {
                this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.push(newCritere);
              }
            }
          });
        }
      });
    }
  }

  additemFreetext(idExe: string, idQue: string, idCri: string, itemValue?: any) {
    const newFreeText = new Freetext();
    newFreeText.id = itemValue ? itemValue.id : uuid();
    newFreeText.text = itemValue ? itemValue.text : this.configurationService.getValue('critereFreeDefaut');

    let idPos = 0;
    // On ajoute un exercice à la fin
    if (idExe === 'end') {
      this.devoirService.devoir.exercices.push(newFreeText);
    } else if (idExe === null) {
      // Cas impossible : un exercice à est à la fin ou avant un exercice
      this.messageService.add('Erreur d\'insertion : une exigence doit être définie', 'danger', 'DEV');
    } else {
      // On ajoute un exercice avant un exercice ou on ajoute autre chose
      for (const [indexExe, exercice] of this.devoirService.devoir.exercices.entries()) {
        if (exercice.id === idExe) {
          // Exercice de référence trouvé : on mémorise sa position
          idPos = indexExe;
          if (idQue === null) {
            // On insère l'exercice avant l'identifiant fourni
            this.devoirService.devoir.exercices.splice(idPos, 0, newFreeText);
            break;
          } else if (idQue === 'end') {
            // Si on veut ajouter une question à la fin alors on l'ajoute
            this.devoirService.devoir.exercices[indexExe].questions.push(newFreeText);
          } else {
            // On ajoute un exercice avant un exercice ou on ajoute autre chose
            for (const [indexQue, question] of this.devoirService.devoir.exercices[indexExe].questions.entries()) {
              if (question.id === idQue) {
                // Question de référence trouvé : on mémorise sa position
                idPos = indexQue;
                if (idCri === null) {
                  // On insère la question avant l'identifiant fourni
                  this.devoirService.devoir.exercices[indexExe].questions.splice(idPos, 0, newFreeText);
                  break;
                } else if (idCri === 'end') {
                  // Si on veut ajouter un critère à la fin alors on l'ajoute
                  this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.push(newFreeText);
                } else {
                  for (const [indexCri, critere] of this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.entries()) {
                    if (critere.id === idCri) {
                      // Critère de référence trouvé : on mémorise sa position
                      this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.splice(indexCri, 0, newFreeText);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  pasteItem(idExe: string, idQue: string, idCri: string) {
    let item = null;
    const tmpItem = this.clipboardService.paste();
    if (tmpItem) {
      if (tmpItem.type === 'free') {
        item = new Freetext().deserialize(tmpItem);
        this.addItem('freetext', idExe, idQue, idCri, item);
      }
      if (tmpItem.type === 'exe') {
        item = new Exercice().deserialize(tmpItem);
        this.addItem('exercice', idExe, idQue, idCri, item);
      }
      if (tmpItem.type === 'que') {
        item = new Question().deserialize(tmpItem);
        this.addItem('question', idExe, idQue, idCri, item);
      }
      if (tmpItem.type === 'cri') {
        item = new Critere().deserialize(tmpItem);
        this.addItem('critere', idExe, idQue, idCri, item);
      }
    }
  }

}
