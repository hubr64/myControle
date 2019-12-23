import { Classe } from './classe';
import { Groupe } from './groupe';
import { Grille } from './grille';
import { Exercice } from './exercice';
import { Freetext } from './freetext';
import { Notation } from './notation';
import { Critere } from './critere';

export class Devoir {
  id: number;
  author: string;
  creationDate: Date;
  modificationDate: Date;
  toolVersion: string;

  titre: string;
  devoirDate: Date;
  arrondi: number;
  notationMode: number;
  notationCible: number;
  classe: Classe;
  grille: Grille;

  exercices: any[];
  notes: Notation[];
  groupes: Groupe[];

  constructor() {
    this.author = '';
    this.creationDate = new Date();
    this.modificationDate = new Date();
    this.toolVersion = '';

    this.titre = '';
    this.arrondi = 0;
    this.devoirDate = new Date();
    this.notationMode = 0;
    this.notationCible = 0;
    this.classe = null;
    this.grille = null;
    this.exercices = [];
    this.notes = [];
    this.groupes = [];
  }

  // Convert from JSON
  deserialize(input: any) {
    this.author = input.meta.author ? input.meta.author : '';
    this.toolVersion = input.meta.version ? input.meta.version : '';
    this.titre = input.data.general.titre ? input.data.general.titre : '';
    this.arrondi = input.data.general.note_arrondi ? input.data.general.note_arrondi : 0;
    this.notationMode = input.data.general.note_final_mode ? input.data.general.note_final_mode : 0;
    this.notationCible = input.data.general.note_final_cible ? input.data.general.note_final_cible : 0;

    this.creationDate = input.meta.date_creation ? new Date(input.meta.date_creation) : new Date();
    this.modificationDate = input.meta.date_save ? new Date(input.meta.date_save) : new Date();
    this.devoirDate = input.data.general.date ? new Date(input.data.general.date) : new Date();
    this.classe = input.data.general.classe ? new Classe().deserialize(input.data.general.classe) : null;
    this.grille = input.data.general.grille ? new Grille().deserialize(input.data.general.grille) : null;
    this.groupes = input.data.groupes ? input.data.groupes : [];
    this.exercices = [];
    this.notes = [];

    for (const keyExe of Object.keys(input.data.exercices)) {
      if (input.data.exercices[keyExe].type === 'exe') {
        this.exercices.push(new Exercice().deserialize(input.data.exercices[keyExe], this.grille));
      }
      if (input.data.exercices[keyExe].type === 'free') {
        this.exercices.push(new Freetext().deserialize(input.data.exercices[keyExe]));
      }
    }
    for (const keyEleve of Object.keys(input.data.notes)) {
      this.notes.push(new Notation().deserialize(input.data.notes[keyEleve], this));
    }

    return this;
  }

  // Convert to JSON
  serialize(): any {
    let serializeDevoir = {
      meta: {
        author: this.author,
        version: this.toolVersion,
        date_creation: this.creationDate,
        date_save: this.modificationDate
      },
      data: {
        general: {
          titre: this.titre,
          date: this.devoirDate,
          note_arrondi: this.arrondi,
          note_final_mode: this.notationMode,
          note_final_cible: this.notationCible,
          classe: this.classe,
          grille: this.grille
        },
        exercices: [],
        notes: [],
        groupes: this.groupes
      }
    };
    for (const exercice of this.exercices) {
      serializeDevoir.data.exercices.push(exercice.serialize());
    }
    for (const note of this.notes) {
      serializeDevoir.data.notes.push(note.serialize());
    }
    return serializeDevoir;
  }

  get bareme(): number {
    let bareme = 0;
    for (const exercice of this.exercices) {
      bareme += exercice.bareme ? exercice.bareme : 0;
    }
    return bareme;
  }

  get baremeArrondi(): number {
    let bareme = this.bareme;
    if (this.arrondi > 0) {
      bareme = Math.round(bareme / this.arrondi) * this.arrondi;
    }
    return bareme;
  }

  getCritere(exerciceId: string, questionId: string, critereId: string): Critere {

    if (this.exercices !== undefined) {
      for (const exe of this.exercices) {
        if (exe.id === exerciceId) {
          return exe.getCritere(questionId, critereId);
        }
      }
    }
    return null;
  }

}
