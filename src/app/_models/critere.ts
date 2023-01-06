import { v4 as uuid } from 'uuid';

import { Deserializable } from './deserializable.model';
import { Capacite } from './capacite';
import { Grille } from './grille';

export class Critere implements Deserializable {
  id: string;
  text: string;
  capacite: Capacite|null;
  bareme: number;
  className: string;

  constructor() {
    this.className = 'Critere';
    this.id='';
    this.text='';
    this.capacite = null;
    this.bareme=0;
  }

  // Convert from JSON
  deserialize(input: any, grille?: Grille, newId: boolean = false) {
    this.id = newId ? uuid() : input.id;
    this.text = input.text;
    this.bareme = parseFloat(input.bareme);
    this.capacite = null;

    if (grille) {
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

  getCapaciteBilan(capaciteBilan: any) {
    if (this.capacite) {
      if (capaciteBilan[this.capacite.id]) {
        capaciteBilan[this.capacite.id].bareme += this.bareme;
      } else {
        capaciteBilan[this.capacite.id] = {
          capacite: this.capacite,
          ok: 0,
          encours: 0,
          ko: 0,
          total: 0,
          pts: 0,
          bareme: this.bareme
        };
      }
    }
  }
}
