import { Deserializable } from './deserializable.model';
import { Competence } from './competence';
import { Grille } from './grille';

export class Capacite implements Deserializable {
  id: string;
  texte: string;
  couleur: string;
  className: string;

  constructor() {
    this.className = 'Capacite';
  }

  deserialize(input: any) {
    this.id = input.id;
    this.texte = input.texte;
    return this;
  }

  getCompetence(grille: Grille): Competence {

    if (grille !== undefined) {
      for (const comp of grille.competences) {
        for (const cap of comp.capacites) {
          if (cap.id === this.id) {
            return comp;
          }
        }
      }
    }
    return null;
  }

}
