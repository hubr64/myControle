import { Component, OnInit, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { environment } from '../../environments/environment';
import { DevoirService } from '../_services/devoir.service';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  private visible = true;
  private appVersionMenu = environment.appVersion;
  private appNameMenu = environment.appName;

  constructor(private devoirService: DevoirService, private messageService: MessageService) { }

  ngOnInit() {
    this.visible = true;
  }

  // Change visibility of main menu
  toggleVisibility() {
    this.visible = !this.visible;
  }
  close() {
    this.visible = false;
  }

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
  }

}
