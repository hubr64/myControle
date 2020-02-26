import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Devoir } from '../_models/devoir';
import { PrintService } from '../_services/print.service';
import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-print-notations',
  templateUrl: './print-notations.component.html',
  styleUrls: ['./print-notations.component.sass']
})
export class PrintNotationsComponent implements OnInit {

  public devoirDetails: Devoir;
  public eleveNotations;
  public classeNotation;
  public bilanCompetencesClasse;

  public printNotesNotValidated: boolean;
  public printNotesBrutes: boolean;
  public printNotesBulletin: boolean;
  public printCommentaire: boolean;
  public printDevoirStatistiques: boolean;
  public printExerciceSummary: boolean;
  public printCompetencesSummary: boolean;

  constructor(
    route: ActivatedRoute,
    public devoirService: DevoirService,
    public printService: PrintService) {

    // On recupere le devoir en local (efficaité)
    this.devoirDetails = this.devoirService.devoir;
    // On recupere toutes les notations (efficacite)
    this.eleveNotations = {};
    for (const eleve of this.devoirDetails.classe.eleves) {
      this.eleveNotations[eleve] = this.devoirDetails.getEleveNotation(eleve);
    }

    // On crecupere toutes les options passées en paramètres
    const options = route.snapshot.params.options.split(',');
    this.printNotesNotValidated = options[0] === 'true';
    this.printNotesBrutes = options[1] === 'true';
    this.printNotesBulletin = options[2] === 'true';
    this.printCommentaire = options[3] === 'true';
    this.printDevoirStatistiques = options[4] === 'true';
    this.printExerciceSummary = options[5] === 'true';
    this.printCompetencesSummary = options[6] === 'true';

    // On recupere les stats de la classe
    this.bilanCompetencesClasse = this.devoirDetails.getCompetenceBilan();

    this.classeNotation = [];
    for (const exercice of this.devoirDetails.exercices) {
      let nbNotations = 0;
      this.classeNotation[exercice.id] = 0;
      for (let key in this.eleveNotations) {
        if (this.eleveNotations[key]) {
          this.classeNotation[exercice.id] += this.eleveNotations[key].getNote(exercice.criteres);
          nbNotations++;
        }
      }
      this.classeNotation[exercice.id] = this.classeNotation[exercice.id] / nbNotations;
    }
  }

  ngOnInit() {
    // Tout est pret
    this.printService.onDataReady();
  }

  filterEleveBy(eleves) {
    let elevesFiltered: string[] = [];

    for (const eleve of eleves) {
      if (this.printNotesNotValidated || this.devoirDetails.getEleveNotation(eleve)) {
        elevesFiltered.push(eleve);
      }
    }

    return elevesFiltered.sort((a, b) =>
      a > b ? 1 : a === b ? 0 : -1
    );

  }

}

