import { Deserializable } from './deserializable.model';
import { Note } from './note';
import { Devoir } from './devoir';

export class Notation implements Deserializable {
  eleve: string;
  commentaire: string;
  notes: Note[];

  // Convert from JSON
  deserialize(input: any, devoir: Devoir) {
    this.eleve = input.eleve;
    this.commentaire = input.commentaire;
    this.notes = [];
    for (const key of Object.keys(input.notes)) {
      this.notes.push(new Note().deserialize(input.notes[key], devoir));
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
}
