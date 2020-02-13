import { Deserializable } from './deserializable.model';
import { Note } from './note';
import { Critere } from './critere';
import { Devoir } from './devoir';

export class Notation implements Deserializable {
  eleve: string;
  commentaire: string;
  notes: Note[];
  noteCoeffs: any[];
  className: string;

  constructor() {
    this.className = 'Notation';
    this.notes = [];
  }

  // Convert from JSON
  deserialize(input: any, devoir: Devoir) {
    this.eleve = input.eleve;
    this.commentaire = input.commentaire;
    this.notes = [];
    for (const key of Object.keys(input.notes)) {
      this.notes.push(new Note().deserialize(input.notes[key], devoir));
    }
    if (devoir) {
      this.noteCoeffs = devoir.noteCoeffs;
    }
    return this;
  }

  // Convert to JSON
  serialize(): any {
    let serializeNotation = {
      eleve: this.eleve,
      commentaire: this.commentaire,
      notes: []
    };
    for (const note of this.notes) {
      serializeNotation.notes.push(note.serialize());
    }
    return serializeNotation;
  }

  set notes_coefficients(value) {
    this.noteCoeffs = value;
    for (const note of this.notes) {
      note.noteCoeffs = this.noteCoeffs;
    }
  }

  // Compute note from all note inside the notation
  getNote(critereFiltre?: any[]): number {
    let computeNote = 0;
    for (const note of this.notes) {
      computeNote += note.getNote(critereFiltre);
    }
    return computeNote;
  }

  // Get note max which mean only note on examining criterias
  getNoteMax(critereFiltre?: any[]): number {
    let computeNote = 0;
    for (const note of this.notes) {
      computeNote += note.getNoteMax(critereFiltre);
    }
    return computeNote;
  }

  getCritereStatus(critere: Critere) {
    for (const note of this.notes) {
      if (note.critere === critere) {
        return note.status;
      }
    }
    return null;
  }

  getCapaciteBilan(capaciteBilan: any, eleve: string): any {
    for (const note of this.notes) {
      if ((eleve === undefined) || (eleve && this.eleve && this.eleve === eleve)) {
        note.getCapaciteBilan(capaciteBilan);
      }
    }
  }
}
