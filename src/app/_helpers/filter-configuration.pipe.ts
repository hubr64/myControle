import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterConfiguration'
})
export class FilterConfigurationPipe implements PipeTransform {

  constructor() {

  }

  transform(configurationItems: any, modifiable: boolean, categorie: string): any[] {
    
    let returnedFilterList: any[] = [];
    for (let [key, configurationItem] of Object.entries(configurationItems)) {
      if (configurationItem['modifiable'] === modifiable && configurationItem['categorie'] === categorie) {
        configurationItem['id'] = key;
        returnedFilterList.push(configurationItem);
      }
    }
    console.dir(returnedFilterList);
    return returnedFilterList;
  }

}
