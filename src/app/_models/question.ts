import { Deserializable } from './deserializable.model';
import { Grille } from './grille';
import { Critere } from './critere';
import { Freetext } from './freetext';

export class Question implements Deserializable {
  id: string;
  title: string;
  criteres: any[];
  className: string;

  constructor() {
    this.className = 'Question';
    this.criteres = [];
  }

  // Convert from JSON
  deserialize(input: any, grille?: Grille) {
    this.id = input.id;
    this.title = input.title;
    this.criteres = [];
    for (const key of Object.keys(input.criteres)) {
      if (input.criteres[key].type === 'cri') {
        this.criteres.push(new Critere().deserialize(input.criteres[key], grille));
      }
      if (input.criteres[key].type === 'free') {
        this.criteres.push(new Freetext().deserialize(input.criteres[key]));
      }
    }
    return this;
  }

  // Convert to JSON
  serialize(): any {
    let serializeQue = {
      id: this.id,
      title: this.title,
      type: 'que',
      criteres: []
    };
    for (const critere of this.criteres) {
      serializeQue.criteres.push(critere.serialize());
    }
    return serializeQue;
  }

  // Compute bareme from all inner criteria
  get bareme(): number {
    let qbareme = 0;
    for (const critere of this.criteres) {
      qbareme += critere.bareme ? critere.bareme : 0;
    }
    return qbareme;
  }

  // Get a criteria anywhere in the question
  getCritere(critereId: string): Critere {
    if (this.criteres !== undefined) {
      for (const cri of this.criteres) {
        if (cri.id === critereId) {
          return cri;
        }
      }
    }
    return null;
  }

  isCapaciteUsed(capacite: any): boolean {
    for (const critere of this.criteres) {
      if (critere.isCapaciteUsed(capacite)) {
        return true;
      }
    }
    return false;
  }

  getCapaciteBilan(capaciteBilan: any): any {
    for (const critere of this.criteres) {
      critere.getCapaciteBilan(capaciteBilan);
    }
  }

}
