import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';

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
import { ModalGridSelectionComponent } from './modal-grid-selection/modal-grid-selection.component';
import { ModalMoveComponent } from './modal-move/modal-move.component';
import { StripHtmlPipe } from './_helpers/strip-html.pipe';
import { ModalConfirmGridComponent } from './modal-confirm-grid/modal-confirm-grid.component';
import { ModalConfirmClasseComponent } from './modal-confirm-classe/modal-confirm-classe.component';
import { ModalClasseSelectionComponent } from './modal-classe-selection/modal-classe-selection.component';
import { ModalEleveNotationComponent } from './modal-eleve-notation/modal-eleve-notation.component';
import { ModalCheckDevoirComponent } from './modal-check-devoir/modal-check-devoir.component';
import { ModalEditGroupComponent } from './modal-edit-group/modal-edit-group.component';
import { PrintDevoirComponent } from './print-devoir/print-devoir.component';
import { PrintComponent } from './print/print.component';
import { PrintService } from './_services/print.service';
import { PrintCorrectionComponent } from './print-correction/print-correction.component';
import { StripMycontroleLinePipe } from './_helpers/strip-mycontrole-line.pipe';
import { PrintNotationsComponent } from './print-notations/print-notations.component';
import { ModalPrintNotationsComponent } from './modal-print-notations/modal-print-notations.component';

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
    ConfigurationComponent,
    ModalGridSelectionComponent,
    ModalMoveComponent,
    StripHtmlPipe,
    StripMycontroleLinePipe,
    ModalConfirmGridComponent,
    ModalConfirmClasseComponent,
    ModalClasseSelectionComponent,
    ModalEleveNotationComponent,
    ModalCheckDevoirComponent,
    ModalEditGroupComponent,
    PrintDevoirComponent,
    PrintComponent,
    PrintCorrectionComponent,
    PrintNotationsComponent,
    ModalPrintNotationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CKEditorModule,
    NgbModule
  ],
  entryComponents: [
    ModalConfirmComponent,
    ModalConfirmRestoreDevoirComponent,
    ModalConfirmGridComponent,
    ModalConfirmClasseComponent,
    ModalGridSelectionComponent,
    ModalClasseSelectionComponent,
    ModalEleveNotationComponent,
    ModalCheckDevoirComponent,
    ModalEditGroupComponent,
    ModalMoveComponent,
    ModalPrintNotationsComponent],
  providers: [
    PrintService,
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
