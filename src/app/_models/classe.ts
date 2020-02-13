import { Deserializable } from './deserializable.model';

export class Classe implements Deserializable {
  id: string;
  titre: string;
  eleves: string[];
  className: string;

  constructor() {
    this.className = 'Classe';
  }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
