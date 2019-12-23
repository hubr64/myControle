import { Deserializable } from './deserializable.model';

export class Classe implements Deserializable {
  id: string;
  titre: string;
  eleves: string[];

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
