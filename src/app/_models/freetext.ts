import { Deserializable } from './deserializable.model';

export class Freetext implements Deserializable {
  id: string;
  text: string;
  className: string;

  constructor() {
    this.className = 'Freetext';
  }

  // Convert from JSON
  deserialize(input: any) {
    this.id = input.id;
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
}
