import { Deserializable } from './deserializable.model';
import { Critere } from './critere';
import { Devoir } from './devoir';

export class Note implements Deserializable {
  critere: Critere;
  status: string;
  noteCoeffs: any[];
  className: string;

  constructor() {
    this.className = 'Note';
    this.critere = null;
  }

  // Convert from JSON
  deserialize(input: any, devoir: Devoir) {
    this.status = input.status;
    this.critere = null;
    if (devoir !== undefined) {
      const structCritere = input.critere.split('_');
      if (structCritere.length === 3) {
        this.critere = devoir.getCritere(structCritere[0], structCritere[0] + '_' + structCritere[1], input.critere);
      }
      this.noteCoeffs = devoir.noteCoeffs;
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
  getNote(critereFiltre?: any[]) {
    if (this.status && this.critere && this.noteCoeffs) {
      // No filter provided thus everything is possible
      if (critereFiltre === undefined) {
        return this.critere.bareme * this.noteCoeffs[this.status];
      } else {
        // A filter is provided and we found the critere in the filter
        if (critereFiltre.indexOf(this.critere) !== -1) {
          return this.critere.bareme * this.noteCoeffs[this.status];
          // Filter provided and the critere is not in the filter
        } else {
          return 0;
        }
      }
    } else {
      return 0;
    }
  }

  // Get note max which mean only note on examining criterias
  getNoteMax(critereFiltre?: any[]) {
    if (this.status && this.critere) {
      // No filter provided thus everything is possible
      if (critereFiltre === undefined) {
        return this.critere.bareme;
      } else {
        // A filter is provided and we found the critere in the filter
        if (critereFiltre.indexOf(this.critere) !== -1) {
          return this.critere.bareme;
          // Filter provided and the critere is not in the filter
        } else {
          return 0;
        }
      }
    } else {
      return 0;
    }
  }

  getCapaciteBilan(capaciteBilan: any): any {
    if (this.critere && this.critere.capacite && capaciteBilan[this.critere.capacite.id]) {
      if (this.status === 'ok') {
        capaciteBilan[this.critere.capacite.id].ok++;
      }
      if (this.status === 'ko') {
        capaciteBilan[this.critere.capacite.id].ko++;
      }
      if (this.status === 'encours') {
        capaciteBilan[this.critere.capacite.id].encours++;
      }
      capaciteBilan[this.critere.capacite.id].pts += this.getNote();
      capaciteBilan[this.critere.capacite.id].total++;
    }
  }

}
