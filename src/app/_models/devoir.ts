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
  notations: Notation[];
  groupes: Groupe[];

  noteCoeffs: any[];

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
    this.notations = [];
    this.groupes = [];

    this.noteCoeffs = [];
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
    this.notations = [];

    for (const keyExe of Object.keys(input.data.exercices)) {
      if (input.data.exercices[keyExe].type === 'exe') {
        this.exercices.push(new Exercice().deserialize(input.data.exercices[keyExe], this.grille));
      }
      if (input.data.exercices[keyExe].type === 'free') {
        this.exercices.push(new Freetext().deserialize(input.data.exercices[keyExe]));
      }
    }
    for (const keyEleve of Object.keys(input.data.notations)) {
      this.notations.push(new Notation().deserialize(input.data.notations[keyEleve], this));
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
        notations: [],
        groupes: this.groupes
      }
    };
    for (const exercice of this.exercices) {
      serializeDevoir.data.exercices.push(exercice.serialize());
    }
    for (const note of this.notations) {
      serializeDevoir.data.notations.push(note.serialize());
    }
    return serializeDevoir;
  }

  set notes_coefficients(value) {
    this.noteCoeffs = value;
    for (const notation of this.notations) {
      notation.notes_coefficients = this.noteCoeffs;
    }
  }

  get bareme(): number {
    let bareme = 0;
    for (const exercice of this.exercices) {
      bareme += exercice.bareme ? exercice.bareme : 0;
    }
    return bareme;
  }

  ajusterNote(note: number) {
    let noteFinale = note;

    // Normal
    if (this.notationMode === 1) {
      noteFinale = noteFinale;
    }
    // Proportionnel
    if (this.notationMode === 2 && this.notationCible > 0) {
      noteFinale = (noteFinale * this.notationCible) / this.bareme;
    }
    // Rapporté
    if (this.notationMode === 3 && this.notationCible > 0) {
      if (noteFinale > this.notationCible) {
        noteFinale = this.notationCible;
      }
    }
    // On finit en arrondissant
    if (this.arrondi > 0) {
      noteFinale = Math.round(noteFinale / this.arrondi) * this.arrondi;
    }

    return noteFinale;
  }

  get note_maximum(): number {
    let note = 0;
    for (const notation of this.notations) {
      const curNote = notation.getNote();
      if (curNote > note) {
        note = curNote;
      }
    }
    return note;
  }

  get note_minimum(): number {
    let note = this.bareme;
    for (const notation of this.notations) {
      const curNote = notation.getNote();
      if (curNote < note) {
        note = curNote;
      }
    }
    return note;
  }

  get note_moyenne(): number {
    let note = 0;
    let nbNote = 0;
    for (const notation of this.notations) {
      note += notation.getNote();
      nbNote++;
    }
    // Moyenne est la somme totale divisée par le nombre de note (on ne tient pas compte des non notés)
    note = note / nbNote;
    // On arrondit à 3 chiffres après la virgule
    note = note * 1000;
    note = Math.round(note);
    note = note / 1000;
    return note;
  }

  get nb_inferieur_moyenne(): number {
    let nb = 0;
    const moyenne = this.note_moyenne;
    for (const notation of this.notations) {
      if (notation.getNote() < moyenne) {
        nb++;
      }
    }
    return nb;
  }

  getEleveNotation(eleve: string): Notation {
    for (const notation of this.notations) {
      if (notation.eleve === eleve) {
        return notation;
      }
    }
    return null;
  }

  getElevesAvecNoteMaximum(): string[] {
    let eleves = [];
    const maximum = this.note_maximum;
    for (const notation of this.notations) {
      if (notation.getNote() === maximum) {
        eleves.push(notation.eleve);
      }
    }
    return eleves;
  }

  getElevesAvecNoteMinimum(): string[] {
    let eleves = [];
    const minimum = this.note_minimum;
    for (const notation of this.notations) {
      if (notation.getNote() === minimum) {
        eleves.push(notation.eleve);
      }
    }
    return eleves;
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
