import { v4 as uuid } from 'uuid';

import { Deserializable } from './deserializable.model';
import { Critere } from './critere';

export class Freetext implements Deserializable {
  id: string;
  text: string;
  className: string;

  constructor() {
    this.className = 'Freetext';
    this.id = '';
    this.text = '';
  }

  // Convert from JSON
  deserialize(input: any, newId: boolean = false) {
    this.id = newId ? uuid() :  input.id;
    this.text = input.text;
    return this;
  }

  // Convert to JSON
  serialize(): any {
    const serializeFree = {
      id: this.id,
      text: this.text,
      type: 'free'
    };
    return serializeFree;
  }

  isCapaciteUsed(capacite: any): boolean {
    return false;
  }

  getCapaciteBilan(capaciteBilan: any) {
  }

  getCritere(critereId: string): null {
    return null;
  }
  getCritereDeep(critereId: string): null {
    return null;
  }
}
