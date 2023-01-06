import { Pipe, PipeTransform } from '@angular/core';

import { ConfigurationItemType, ConfigurationItemsType } from '../_services/configuration.service';

@Pipe({
  name: 'filterConfiguration'
})
export class FilterConfigurationPipe implements PipeTransform {

  constructor() {

  }

  transform(configurationItems: ConfigurationItemsType, modifiable: boolean, categorie: string): any[] {
    
    let returnedFilterList: any[] = [];
    let key: string;
    let configurationItem: any;

    for ([key, configurationItem] of Object.entries(configurationItems)) {
      if (configurationItem['modifiable'] === modifiable && configurationItem['categorie'] === categorie) {
        configurationItem['id'] = key;
        returnedFilterList.push(configurationItem);
      }
    }
    return returnedFilterList;
  }

}
