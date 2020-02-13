import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Devoir } from '../_models/devoir';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-modal-check-devoir',
  templateUrl: './modal-check-devoir.component.html',
  styleUrls: ['./modal-check-devoir.component.sass']
})
export class ModalCheckDevoirComponent implements OnInit {

  @Input() devoir: Devoir;

  @ViewChild('imgCheck', { static: false }) imgCheck: ElementRef;
  public urlList: string[];
  public urlListPos = 0;

  public errorList;

  constructor(
    public modal: NgbActiveModal,
    public configurationService: ConfigurationService
  ) {
    this.errorList = [];
    this.urlList = [];
    this.urlListPos = 0;
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.devoir) {
      this.checkGeneral();
      // L'outil vérifie que tous les exercices contiennent des questions. Sinon erreur.
      // L'outil vérifie que tous les exercices contiennent un intitulé. Sinon erreur.
      this.checkExercices();
      // L'outil vérifie que toutes les questions contiennent des critères. Sinon erreur.
      // L'outil vérifie que toutes les questions contiennent un intitulé. Sinon erreur.
      this.checkQuestions();
      // L'outil vérifie que tous les barêmes sont remplis. Sinon erreur. => N/A : Ne peut être que égal à 0
      // L'outil vérifie que tous les barêmes sont différents de 0. Sinon warning.
      // L'outil vérifie que tous les critères ont une capacité. Sinon Warning.
      // L'outil vérifie que tous les critères contiennent un texte. Sinon erreur.
      this.checkCritere();
      // L'outil vérifie que tous les textes libres contiennent un texte. Sinon warning.
      this.checkFreeText();
      // L'outil vérifie que toutes les images sont conformes accessibles ou bien importés dans le document.
      this.checkURL();
      // Si la notation a commencé, l'outil vérifie que tous les élèves sont évalués. Sinon warning.
      // Si la notation a commencé, l'outil vérifie qu'un élève évalué est bien évalué entièrement. Sinon error.
      // Si la notation a commencé, l'outil vérifie qu'un élève évalué a bien un commentaire d'évaluation. Sinon error.
      this.checkNotation();

    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  checkGeneral() {
    let generalPb = 0;
    if (this.devoir.titre === '' || this.devoir.titre === this.configurationService.getValue('devoirTitreDefault')) {
      this.errorList.push({
        type: 'Général',
        msg: 'Le titre du devoir n\'est pas renseigné.',
        level: 'danger'
      });
      generalPb++;
    }
    if (this.devoir.author === '') {
      this.errorList.push({
        type: 'Général',
        msg: 'L\'auteur du devoir n\'est pas renseigné.',
        level: 'danger'
      });
      generalPb++;
    }
    if (this.devoir.devoirDate === null) {
      this.errorList.push({
        type: 'Général',
        msg: 'La date du devoir n\'est pas renseignée.',
        level: 'danger'
      });
      generalPb++;
    }

  }

  checkURL() {
    // Recherche des URL dans le devoir (converti en string car plus simple à chercher avec une regexp globale)
    const devoirString = JSON.stringify(this.devoir);
    const regex = /src=\\"http[^"]+"/g;
    const foundHttps = devoirString.match(regex);

    // ON parcours tous les résultats de recherche
    for (const foundHttp of foundHttps.entries()) {
      // ON ne retiuent que l'URL sans les décorations autour
      const url = foundHttp[1].slice(6, -2);
      // On ne garde pas les URL qui fabriquent les formules en LATEX (trop gourmand en mémoire)
      if (url.indexOf('latex.codecogs.com') === -1) {
        this.urlList.push(url);
      }
    }
    // Si on a au moins une URL alors on la charge dans l'image de test
    if (this.urlList.length > 0) {
      this.urlListPos = 0;
      this.imgCheck.nativeElement.src = this.urlList[this.urlListPos];
    }
  }
  urlError(url) {
    this.errorList.push({
      type: 'Images',
      msg: 'L\'URL de l\'image ' + url + ' n\'est pas valide.',
      level: 'danger'
    });
    this.nextURL();
  }
  urlSucceed(url) {
    this.errorList.push({
      type: 'Images',
      msg: 'L\'URL de l\'image ' + url + ' est  valide.',
      level: 'success'
    });
    this.nextURL();
  }
  nextURL() {
    if (this.urlListPos < this.urlList.length - 1) {
      this.urlListPos++;
      this.imgCheck.nativeElement.src = this.urlList[this.urlListPos];
    }
  }

  checkCritere() {
    let criterePb = 0;
    for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
      if (exercice.questions) {
        for (const [indexQue, question] of exercice.questions.entries()) {
          if (question.criteres) {
            for (const [indexCri, critere] of question.criteres.entries()) {
              if (critere.className === 'Critere') {
                if (critere.bareme === 0) {
                  this.errorList.push({
                    type: 'Edition',
                    msg: 'Un des critères de la question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' possède un barême nul.',
                    level: 'warning'
                  });
                  criterePb++;
                }
                if (critere.capacite === null) {
                  this.errorList.push({
                    type: 'Edition',
                    msg: 'Un des critères de la question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' ne possède pas de capacité liée.',
                    level: 'warning'
                  });
                  criterePb++;
                }
                if (critere.text === '' || critere.text === this.configurationService.getValue('critereTitreDefaut')) {
                  this.errorList.push({
                    type: 'Edition',
                    msg: 'Un des critères de la question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' ne possède aucun texte.',
                    level: 'danger'
                  });
                  criterePb++;
                }
              }
            }
          }
        }
      }
    }
    if (criterePb === 0) {
      this.errorList.push({
        type: 'Edition',
        msg: 'Tous les critères sont corrects.',
        level: 'success'
      });
    }
  }

  checkExercices() {
    let exercicePb = 0;
    for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
      if (exercice.title === '' || exercice.title === this.configurationService.getValue('exerciceTitreDefaut')) {
        this.errorList.push({
          type: 'Edition',
          msg: 'L\'exercice n°' + (indexExe + 1) + ' possède un intitulé vide.',
          level: 'warning'
        });
        exercicePb++;
      }
      if (exercice.questions && exercice.questions.length === 0) {
        this.errorList.push({
          type: 'Edition',
          msg: 'L\'exercice n°' + (indexExe + 1) + ' ne contient ni question ni texte libre.',
          level: 'danger'
        });
        exercicePb++;
      }
    }
    if (exercicePb === 0) {
      this.errorList.push({
        type: 'Edition',
        msg: 'Tous les exercices sont corrects.',
        level: 'success'
      });
    }
  }

  checkQuestions() {
    let questionPb = 0;
    for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
      if (exercice.questions) {
        for (const [indexQue, question] of exercice.questions.entries()) {
          if (question.title === '' || question.title === this.configurationService.getValue('questionTitreDefaut')) {
            this.errorList.push({
              type: 'Edition',
              msg: 'La question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' possède un intitulé vide.',
              level: 'warning'
            });
            questionPb++;
          }
          if (question.criteres && question.criteres.length === 0) {
            this.errorList.push({
              type: 'Edition',
              msg: 'La question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' ne contient ni critère ni texte libre.',
              level: 'danger'
            });
            questionPb++;
          }
        }
      }
    }
    if (questionPb === 0) {
      this.errorList.push({
        type: 'Edition',
        msg: 'Toutes les questions sont correctes.',
        level: 'success'
      });
    }
  }

  checkFreeText() {
    let freeTextPb = 0;
    for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
      if (exercice.className === 'Freetext') {
        if (exercice.text === '' || exercice.text === this.configurationService.getValue('critereFreeDefaut')) {
          this.errorList.push({
            type: 'Edition',
            msg: 'Le Texte libre n°' + (indexExe + 1) + ' ne possède aucun texte.',
            level: 'danger'
          });
          freeTextPb++;
        }
      } else {
        for (const [indexQue, question] of exercice.questions.entries()) {
          if (question.className === 'Freetext') {
            if (question.text === '' || question.text === this.configurationService.getValue('critereFreeDefaut')) {
              this.errorList.push({
                type: 'Edition',
                msg: 'Le Texte libre n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' ne possède aucun texte.',
                level: 'danger'
              });
              freeTextPb++;
            }
          } else {
            for (const [indexCri, critere] of question.criteres.entries()) {
              if (critere.className === 'Freetext') {
                if (critere.text === '' || critere.text === this.configurationService.getValue('critereFreeDefaut')) {
                  this.errorList.push({
                    type: 'Edition',
                    msg: 'Un des textes libres de la question n°' + (indexQue + 1) + ' de l\'exercice n°' + (indexExe + 1) + ' ne possède aucun texte.',
                    level: 'danger'
                  });
                  freeTextPb++;
                }
              }
            }
          }
        }
      }
    }
    if (freeTextPb === 0) {
      this.errorList.push({
        type: 'Edition',
        msg: 'Tous les textes libres sont corrects.',
        level: 'success'
      });
    }
  }

  checkNotation() {
    let notationPb = 0;
    if (this.devoir.notations.length > 0) {
      if (this.devoir.notations.length !== this.devoir.classe.eleves.length) {
        this.errorList.push({
          type: 'Notation',
          msg: 'Tous les élèves de la classe choisie n\'ont pas été notés.',
          level: 'warning'
        });
        notationPb++;
      }
      for (const [indexNot, notation] of this.devoir.notations.entries()) {
        if (notation.getNoteMax() !== this.devoir.bareme) {
          this.errorList.push({
            type: 'Notation',
            msg: 'L\'élève ' + notation.eleve + ' n\'est pas entièrement évalué.',
            level: 'danger'
          });
        }
        if (notation.commentaire === null || notation.commentaire === '') {
          this.errorList.push({
            type: 'Notation',
            msg: 'La note de l\'élève ' + notation.eleve + ' n\'est pas commentée.',
            level: 'warning'
          });
        }
      }
    }

    if (notationPb === 0) {
      this.errorList.push({
        type: 'Edition',
        msg: 'Toute la notation est correcte.',
        level: 'success'
      });
    }
  }

}
