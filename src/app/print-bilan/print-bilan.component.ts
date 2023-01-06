import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Devoir } from '../_models/devoir';
import { PrintService } from '../_services/print.service';
import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-print-bilan',
  templateUrl: './print-bilan.component.html',
  styleUrls: ['./print-bilan.component.sass']
})
export class PrintBilanComponent implements OnInit {

  public devoirDetails: Devoir;
  public eleveNotations: { [key: string]: any } ;
  public classeNotation: any[];
  public bilanCompetencesClasse;

  public printNotesNotValidated: boolean;
  public printNotesBrutes: boolean;
  public printNotesBulletin: boolean;
  public printCommentaire: boolean;
  public printDevoirStatistiques: boolean;
  public printCompetencesSummary: boolean;

  public nbColBilan: number;

  constructor(
    route: ActivatedRoute,
    public devoirService: DevoirService,
    public printService: PrintService) {

    // On recupere le devoir en local (efficacité)
    this.devoirDetails = this.devoirService.devoir;
    // On recupere toutes les notations (efficacite)
    this.eleveNotations = {};
    if(this.devoirDetails.classe){
      for (const eleve of this.devoirDetails.classe.eleves) {
        this.eleveNotations[eleve] = this.devoirDetails.getEleveNotation(eleve);
      }
    }

    // On crecupere toutes les options passées en paramètres
    const routeOptions = route.snapshot.params['options'].split(',');
    this.printNotesNotValidated = routeOptions[0] === 'true';
    this.printNotesBrutes = routeOptions[1] === 'true';
    this.printNotesBulletin = routeOptions[2] === 'true';
    this.printCommentaire = routeOptions[3] === 'true';
    this.printDevoirStatistiques = routeOptions[4] === 'true';
    this.printCompetencesSummary = routeOptions[5] === 'true';

    // On recupere les stats de la classe
    this.bilanCompetencesClasse = this.devoirDetails.getCompetenceBilan();

    this.classeNotation = [];
    for (const exercice of this.devoirDetails.exercices) {
      let nbBilan = 0;
      this.classeNotation[exercice.id] = 0;
      for (let key in this.eleveNotations) {
        if (this.eleveNotations[key]) {
          this.classeNotation[exercice.id] += this.eleveNotations[key].getNote(exercice.criteres);
          nbBilan++;
        }
      }
      this.classeNotation[exercice.id] = this.classeNotation[exercice.id] / nbBilan;
    }

    // On calcule le nombre de colonnes dans le bilan
    this.nbColBilan = 2;
    this.nbColBilan += this.printNotesBrutes ? 1 : 0;
    this.nbColBilan += this.printNotesBulletin ? 1 : 0;
    this.nbColBilan += this.printCommentaire ? 1 : 0;

  }

  ngOnInit() {
    // Tout est pret
    this.printService.onDataReady();
  }

  filterEleveBy(eleves: string[]) {
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

  getNotePosition(eleve: string): number {
    let notesArray = [];
    for (let key in this.eleveNotations) {
      if (this.eleveNotations[key]) {
        notesArray.push(this.eleveNotations[key].getNote());
      }
    }

    notesArray.sort();

    return (notesArray.indexOf(this.eleveNotations[eleve].getNote()) + 1);
  }
}
