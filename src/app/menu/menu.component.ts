import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { environment } from '../../environments/environment';
import { DevoirService } from '../_services/devoir.service';
import { ClasseService } from '../_services/classe.service';
import { MessageService } from '../_services/message.service';
import { GrilleService } from '../_services/grille.service';
import { PrintService } from '../_services/print.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  @Output() toggleModeDevoir = new EventEmitter<string>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  public visible = true;
  public appVersionMenu = environment.appVersion;
  public appNameMenu = environment.appName;
  public mode = '';

  constructor(
    public devoirService: DevoirService,
    public classeService: ClasseService,
    public messageService: MessageService,
    public configurationService: ConfigurationService,
    public grilleService: GrilleService,
    public printService: PrintService) {
    this.mode = this.configurationService.getValue('defaultMode');
  }

  ngOnInit() {
    this.visible = true;
    this.devoirService.loadNewDevoirSub.subscribe((newDevoir) => {
      if (newDevoir === true) {
        this.close();
        this.toggleMode(this.configurationService.getValue('defaultMode'));
      }
    });
  }

  // Change visibility of main menu
  toggleVisibility() {
    this.visible = !this.visible;
  }
  close() {
    this.visible = false;
  }

  // Actions of the toolbar
  toggleMode(newMode: string) {
    // Si on veut passer en mode notation mais qu'aucune classe n'est définie alors ce n'est pas possible
    if (newMode === 'notation' && this.devoirService.devoir.classe === null) {
      newMode = 'edition';
    }
    this.mode = newMode;
    this.toggleModeDevoir.emit(this.mode);
  }

  // Actions of the menu
  openFile($event): void {
    this.devoirService.loadLocalFile($event.target);
  }

  openNewDevoir() {
    this.devoirService.clearDevoir();
    this.close();
  }

  openExistingDevoir() {
    const event = new MouseEvent('click', { bubbles: true });
    this.fileInput.nativeElement.dispatchEvent(event);
    this.close();
  }

  saveCurrentDevoir() {
    this.devoirService.saveDevoir();
    this.close();
  }

  checkDevoir() {
    this.devoirService.checkDevoir();
    this.close();
  }

  printDevoir() {
    this.printService.printDocument('devoir');
  }

  printCorrection() {
    this.printService.printDocument('correction');
  }

}
