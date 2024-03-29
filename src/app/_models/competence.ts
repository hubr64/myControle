import { Deserializable } from './deserializable.model';
import { Capacite } from './capacite';

export class Competence implements Deserializable {
  titre: string;
  couleur: string;
  capacites: Capacite[];
  className: string;

  constructor() {
    this.className = 'Competence';
    this.titre = '';
    this.couleur = '';
    this.capacites = [];
  }

  deserialize(input: any) {
    this.titre = input.titre;
    this.couleur = input.couleur;
    this.capacites = [];
    for (const key of Object.keys(input.capacites)) {
      let newCapacite = new Capacite().deserialize(input.capacites[key]);
      newCapacite.couleur = this.couleur;
      this.capacites.push(newCapacite);
    }
    return this;
  }
}
