import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { DevoirComponent } from './devoir/devoir.component';
import { DevoirEditionComponent } from './devoir-edition/devoir-edition.component';
import { DevoirNotationComponent } from './devoir-notation/devoir-notation.component';
import { GeneralitesComponent } from './generalites/generalites.component';
import { MessagesComponent } from './messages/messages.component';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { DevoirEditionToolboxComponent } from './devoir-edition-toolbox/devoir-edition-toolbox.component';
import { DevoirEditionOptionboxComponent } from './devoir-edition-optionbox/devoir-edition-optionbox.component';
import { ModalConfirmRestoreDevoirComponent } from './modal-confirm-restore-devoir/modal-confirm-restore-devoir.component';
import { ConfigurationComponent } from './configuration/configuration.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    GeneralitesComponent,
    DevoirComponent,
    DevoirEditionComponent,
    DevoirNotationComponent,
    MessagesComponent,
    ModalConfirmComponent,
    DevoirEditionToolboxComponent,
    DevoirEditionOptionboxComponent,
    ModalConfirmRestoreDevoirComponent,
    ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CKEditorModule,
    NgbModule
  ],
  entryComponents: [ModalConfirmComponent, ModalConfirmRestoreDevoirComponent],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
