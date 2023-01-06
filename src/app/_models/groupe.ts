import { Deserializable } from './deserializable.model';

export class Groupe implements Deserializable {
  id: string;
  nom: string;
  eleves: string[];
  className: string;

  constructor() {
    this.className = 'Groupe';
    this.id = '';
    this.nom = '';
    this. eleves = [];
  }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

  isEleveInGroupe(eleve: string) {
    return this.eleves.indexOf(eleve) !== -1;
  }
}
