import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripMycontroleLine'
})
export class StripMycontroleLinePipe implements PipeTransform {

  replaceMyControleLines(correspondance: string, nb: number, decalage: number, chaine: string) {
    let newString = '';
    for (let i = 0; i < nb; i++) {
      newString += '<div class="mycontrole-line">&nbsp;</div>';
    }
    return newString;
  }

  transform(value: string): any {
    let nouvellevalue = value.replace(/<div class="mycontrole-lines.+Bloc de (\d+) lignes<\/span>.*<\/div>/, this.replaceMyControleLines);
    nouvellevalue = nouvellevalue.replace(/<span class="cke_reset.*<\/span>/, '');
    nouvellevalue = nouvellevalue.replace(/<div data-cke-hidden-sel.*<\/div>/, '');
    return nouvellevalue;
  }

}
