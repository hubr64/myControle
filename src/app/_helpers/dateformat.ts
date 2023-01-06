import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {


  toInteger(value: any): number {
    return parseInt(`${value}`, 10);
  }

  isNumber(value: any): value is number {
    return !isNaN(this.toInteger(value));
  }

  padNumber(value: number) {
    if (this.isNumber(value)) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }

  parse(value: string): NgbDateStruct|null {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && this.isNumber(dateParts[0])) {
        return { day: this.toInteger(dateParts[0]), month: 0, year: 0 };
      } else if (dateParts.length === 2 && this.isNumber(dateParts[0]) && this.isNumber(dateParts[1])) {
        return { day: this.toInteger(dateParts[0]), month: this.toInteger(dateParts[1]), year: 0 };
      } else if (dateParts.length === 3 && this.isNumber(dateParts[0]) && this.isNumber(dateParts[1]) && this.isNumber(dateParts[2])) {
        return { day: this.toInteger(dateParts[0]), month: this.toInteger(dateParts[1]), year: this.toInteger(dateParts[2]) };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date ?
      `${this.isNumber(date.day) ? this.padNumber(date.day) : ''}/${this.isNumber(date.month) ? this.padNumber(date.month) : ''}/${date.year}` :
      '';
  }
}
