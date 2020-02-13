import { Deserializable } from './deserializable.model';
import { Capacite } from './capacite';
import { Grille } from './grille';

export class Critere implements Deserializable {
  id: string;
  text: string;
  capacite: Capacite;
  bareme: number;

  // Convert from JSON
  deserialize(input: any, grille?: Grille) {
    this.id = input.id;
    this.text = input.text;
    this.bareme = parseFloat(input.bareme);
    this.capacite = null;

    if (grille !== undefined) {
      if (input.capacite) {
        this.capacite = grille.getCapacite(input.capacite);
      }
    }
    return this;
  }

  // Convert to JSON
  serialize(): any {
    const serializeCri = {
      id: this.id,
      text: this.text,
      bareme: this.bareme,
      type: 'cri',
      capacite: this.capacite ? this.capacite.id : ''
    };
    return serializeCri;
  }

  isCapaciteUsed(capacite: Capacite): boolean {
    if (this.capacite && this.capacite.id === capacite.id) {
      return true;
    }
    return false;
  }

  getCapaciteBilan(capaciteBilan: any): any {
    if (this.capacite) {
      if (capaciteBilan[this.capacite.id]) {
        capaciteBilan[this.capacite.id].pts += this.bareme;
      } else {
        capaciteBilan[this.capacite.id] = {
          capacite: this.capacite,
          ok: 0,
          encours: 0,
          ko: 0,
          total: 0,
          pts: this.bareme
        };
      }
    }
  }
}
