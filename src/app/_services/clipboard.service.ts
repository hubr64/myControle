import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  public clipboardKeyName;

  clipboardType = null;
  clipboardTypeConversion: {[key:string]:any } = {
    free: 'freetext',
    exe: 'exercice',
    cri: 'critere',
    que: 'question'
  };

  constructor(
    public configurationService: ConfigurationService
  ) {
    // Build clipboard identifier
    this.clipboardKeyName = this.configurationService.getValue('storagePrefix') + 'clipboard';

    // At creation, check if something is not already in clipboard
    this.loadClipboardType();
  }

  loadClipboardType() {
    // Get local storage of the clipboard
    const tmpContent = localStorage.getItem(this.clipboardKeyName);
    // If found something
    if (tmpContent) {
      // Get if from JSON format
      const tmpItem = JSON.parse(tmpContent);
      // If the JSon format is compliant
      if (tmpItem) {
        // Compute the type of item is clipboard
        this.clipboardType = this.clipboardTypeConversion[tmpItem.type];
      }
    }
  }

  // Store an element in the clipboard
  copy(itemContent: any) {
    // First compute and memorize the type
    this.clipboardType = this.clipboardTypeConversion[itemContent.type];
    // Next store it in local storage
    localStorage.setItem(this.clipboardKeyName, JSON.stringify(itemContent));
  }

  // Get element from the clipboard and return it
  paste(): any {
    const tmpContent = localStorage.getItem(this.clipboardKeyName);
    if (tmpContent) {
      return JSON.parse(tmpContent);
    }
    return null;
  }

}
