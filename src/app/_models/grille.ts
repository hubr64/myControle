import { Deserializable } from './deserializable.model';
import { Competence } from './competence';
import { Capacite } from './capacite';

export class Grille implements Deserializable {
  id: string;
  titre: string;
  competences: Competence[];

  deserialize(input: any) {

    this.id = input.id;
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
