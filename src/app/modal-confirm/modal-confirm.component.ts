import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.sass']
})
export class ModalConfirmComponent implements OnInit {

  @Input() itemConfirm;
  public itemDetails = '';
  public itemContent = null;

  constructor(
    public messageService: MessageService,
    public modal: NgbActiveModal) {
  }
  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.itemConfirm) {
      switch (this.itemConfirm.constructor.name) {
        case 'Freetext': {
          this.itemDetails = 'un texte libre';
          this.itemContent = null;
          break;
        }
        case 'Exercice': {
          this.itemDetails = 'un exercice (' + this.itemConfirm.bareme + ' pts)';
          let nbQuestions = 0;
          let nbCriteres = 0;
          let nbFree = 0;
          this.itemConfirm.questions.forEach((question, indexQue) => {
            if (question.criteres) {
              nbQuestions++;
              question.criteres.forEach((critere, indexCri) => {
                if (critere.bareme) {
                  nbCriteres++;
                } else {
                  nbFree++;
                }
              });
            } else {
              nbFree++;
            }
          });
          this.itemContent = '<li>Nombre de questions : ' + nbQuestions +
            '</li><li>Nombre de critères : ' + nbCriteres +
            '</li><li>Nombre de textes libres : ' + nbFree + '</li>';
          break;
        }
        case 'Question': {
          this.itemDetails = 'une question (' + this.itemConfirm.bareme + ' pts)';
          let nbCriteres = 0;
          let nbFree = 0;
          this.itemConfirm.criteres.forEach((critere, indexCri) => {
            if (critere.bareme) {
              nbCriteres++;
            } else {
              nbFree++;
            }
          });
          this.itemContent = '<li>Nombre de critères : ' + nbCriteres +
            '</li><li>Nombre de textes libres : ' + nbFree + '</li>';
          break;
        }
        case 'Critere': {
          this.itemDetails = 'un critère (' + this.itemConfirm.bareme + ' pts)';
          this.itemContent = null;
          break;
        }
        default: {
          this.messageService.add('Erreur de traitement pour une suppression de données', 'warning', 'USER');
          break;
        }
      }
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 1000);
    }
  }

}
