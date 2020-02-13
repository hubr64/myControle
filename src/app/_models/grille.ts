import { Deserializable } from './deserializable.model';
import { Competence } from './competence';
import { Capacite } from './capacite';

export class Grille implements Deserializable {
  titre: string;
  competences: Competence[];
  className: string;

  constructor() {
    this.className = 'Grille';
    this.competences = [];
  }

  deserialize(input: any) {
    this.titre = input.titre;
    this.competences = [];
    for (const key of Object.keys(input.competences)) {
      this.competences.push(new Competence().deserialize(input.competences[key]));
    }
    return this;
  }

  getCapacite(capacite: string): Capacite {

    for (const comp of this.competences) {
      for (const cap of comp.capacites) {
        if (cap.id === capacite) {
          return cap;
        }
      }
    }
    return null;
  }
}
