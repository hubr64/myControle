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

  className: string;

  constructor() {
    this.className = 'Devoir';
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
    this.groupes = [];
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
    for (const keyGroupe of Object.keys(input.data.groupes)) {
      this.groupes.push(new Groupe().deserialize(input.data.groupes[keyGroupe]));
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
    for (const notation of this.notations) {
      serializeDevoir.data.notations.push(notation.serialize());
    }
    return serializeDevoir;
  }

  set notes_coefficients(value) {
    this.noteCoeffs = value;
    for (const notation of this.notations) {
      notation.notes_coefficients = this.noteCoeffs;
    }
  }

  // GESTION DES NOTES
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
    let foundMax = false;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        const curNote = notation.getNote();
        if (curNote > note) {
          note = curNote;
          foundMax = true;
        }
      }
    }
    return foundMax ? note : 0;
  }

  get note_minimum(): number {
    let note = this.bareme;
    let foundMin = false;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        const curNote = notation.getNote();
        if (curNote < note) {
          note = curNote;
          foundMin = true;
        }
      }
    }
    return foundMin ? note : 0;
  }

  get note_moyenne(): number {
    let note = 0;
    let nbNote = 0;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        note += notation.getNote();
        nbNote++;
      }
    }
    if (nbNote > 0) {
      // Moyenne est la somme totale divisée par le nombre de note (on ne tient pas compte des non notés)
      note = note / nbNote;
      // On arrondit à 3 chiffres après la virgule
      note = note * 1000;
      note = Math.round(note);
      note = note / 1000;
    }
    return note;
  }

  get nb_inferieur_moyenne(): number {
    let nb = 0;
    const moyenne = this.note_moyenne;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        if (notation.getNote() < moyenne) {
          nb++;
        }
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

  deleteEleveNotation(eleve: string) {
    let indexToDelete = null;
    for (const [indexNotation, notation] of this.notations.entries()) {
      if (notation.eleve === eleve) {
        indexToDelete = indexNotation;
        break;
      }
    }
    if (indexToDelete !== null) {
      // On supprime la notation dans le devoir
      this.notations.splice(indexToDelete, 1);
    }
  }

  getElevesAvecNoteMaximum(): string[] {
    let eleves = [];
    const maximum = this.note_maximum;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        if (notation.getNote() === maximum) {
          eleves.push(notation.eleve);
        }
      }
    }
    return eleves;
  }

  getElevesAvecNoteMinimum(): string[] {
    let eleves = [];
    const minimum = this.note_minimum;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        if (notation.getNote() === minimum) {
          eleves.push(notation.eleve);
        }
      }
    }
    return eleves;
  }

  // GESTION DES CRITERES/CAPACITES

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

  getCritereDeep(critereId: string): Critere {
    if (this.exercices !== undefined) {
      for (const exercice of this.exercices) {
        const critereFound = exercice.getCritereDeep(critereId);
        if (critereFound !== null) {
          return critereFound;
        }
      }
    }
    return null;
  }

  isCapaciteUsed(capacite: any): boolean {
    for (const exercice of this.exercices) {
      if (exercice.isCapaciteUsed(capacite)) {
        return true;
      }
    }
    return false;
  }

  getCapaciteBilan(eleve?: string): any {
    let capaciteBilan = [];
    for (const exercice of this.exercices) {
      exercice.getCapaciteBilan(capaciteBilan);
    }
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        notation.getCapaciteBilan(capaciteBilan, eleve);
      }
    }
    return capaciteBilan;
  }

  getCompetenceBilan(eleve?: string): any {
    // On recupere d'abord le bilan de capacites (par eleve ou au global selon le parametre)
    const capaciteBilan = this.getCapaciteBilan(eleve);

    // On construit ensuite un bilan de compentence en parcourant toutes les competences
    let competenceBilan = [];
    for (const currentCompetence of this.grille.competences) {
      // On créé un bilan vierge de la competence en cours de traitement
      let newCompetence = {
        competence: currentCompetence,
        ok: 0,
        encours: 0,
        ko: 0,
        total: 0,
        pts: 0,
        bareme: 0,
        capacites: []
      };
      // On parcours toutes les capacites de cette competence
      for (const capacite of currentCompetence.capacites) {
        // Si cette capacite existe bien dans le bilan de capcite alors elle vient enrichir le bilan de compétences
        if (capaciteBilan[capacite.id]) {
          newCompetence.ok += capaciteBilan[capacite.id].ok;
          newCompetence.encours += capaciteBilan[capacite.id].encours;
          newCompetence.ko += capaciteBilan[capacite.id].ko;
          newCompetence.total += capaciteBilan[capacite.id].total;
          newCompetence.pts += capaciteBilan[capacite.id].pts;
          newCompetence.bareme += capaciteBilan[capacite.id].bareme;
          newCompetence.capacites.push(capaciteBilan[capacite.id]);
        }
      }
      // J'ai finit mon parcours je viens enrichir mon bilan de compétences uniquement s'il est utilisé
      if (newCompetence.bareme > 0) {
        competenceBilan.push(newCompetence);
      }
    }
    return competenceBilan;
  }


  // GESTION DES GROUPES
  getEleveGroupe(eleve: string): Groupe {
    for (const groupe of this.groupes) {
      if (groupe.eleves.indexOf(eleve) !== -1) {
        return groupe;
      }
    }
    return null;
  }

  isGroupe(nomGroupe: string): boolean {
    let isGroupe = false;
    for (const groupe of this.groupes) {
      if (groupe.nom === nomGroupe) {
        return true;
      }
    }
    return isGroupe;
  }

  get nb_notations(): number {
    let nbNotations = 0;
    for (const notation of this.notations) {
      if (this.isGroupe(notation.eleve) === false) {
        nbNotations++;
      }
    }
    return nbNotations;
  }

}
