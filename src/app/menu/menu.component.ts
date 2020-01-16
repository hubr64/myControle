import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { environment } from '../../environments/environment';
import { DevoirService } from '../_services/devoir.service';
import { ClasseService } from '../_services/classe.service';
import { MessageService } from '../_services/message.service';
import { GrilleService } from '../_services/grille.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  @Output() toggleModeDevoir = new EventEmitter<string>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  private visible = true;
  private appVersionMenu = environment.appVersion;
  private appNameMenu = environment.appName;
  public mode = '';

  constructor(
    private devoirService: DevoirService,
    private classeService: ClasseService,
    private messageService: MessageService,
    private configurationService: ConfigurationService,
    private grilleService: GrilleService
  ) {
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

}
