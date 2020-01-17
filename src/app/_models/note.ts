import { Deserializable } from './deserializable.model';
import { Critere } from './critere';
import { Devoir } from './devoir';

export class Note implements Deserializable {
  critere: Critere;
  status: string;

  // Convert from JSON
  deserialize(input: any, devoir: Devoir) {
    this.status = input.status;
    this.critere = null;
    if (devoir !== undefined) {
      const structCritere = input.critere.split('_');
      if (structCritere.length === 3) {
        this.critere = devoir.getCritere(structCritere[0], structCritere[0] + '_' + structCritere[1], input.critere);
      }
    }
    return this;
  }

  // Convert to JSON
  serialize(): any {
    const serializeNote = {
      status: this.status,
      critere: this.critere ? this.critere.id : ''
    };
    return serializeNote;
  }

  // Get note according to status and criteria bareme
  getNote(noteCoeffs) {
    return this.critere.bareme * noteCoeffs[this.status];
  }
}
