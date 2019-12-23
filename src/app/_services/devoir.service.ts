import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Devoir } from '../_models/devoir';
import { Classe } from '../_models/classe';
import { Grille } from '../_models/grille';
import { Exercice } from '../_models/exercice';
import { Freetext } from '../_models/freetext';
import { Notation } from '../_models/notation';

import { MessageService } from './message.service';
import { ConfigurationService } from './configuration.service';

import { ModalConfirmRestoreDevoirComponent } from '../modal-confirm-restore-devoir/modal-confirm-restore-devoir.component';

import { saveAs } from 'file-saver';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevoirService {

  private currentFileName = '';
  private toolVersion = environment.appVersion;

  public docIsEdited = false;
  public devoir;

  constructor(
    private messageService: MessageService,
    private configurationService: ConfigurationService,
    private modalService: NgbModal) {

    const tmpDevoir = localStorage.getItem('devoir');
    if (this.devoir === undefined && tmpDevoir) {

      // Display modal window to ask user for confirmation
      const modalRef = this.modalService.open(ModalConfirmRestoreDevoirComponent, { centered: true });
      // @ts-ignore: Provide it the required item to delete (to display more information)
      modalRef.componentInstance.devoir = tmpDevoir;

      // Manage answer of the user
      modalRef.result.then((result) => {
        // If user confirms thus restore the devoir
        this.loadDevoir(tmpDevoir);
        this.docIsEdited = true;
      }, (reason) => {
        // Restoration is cancelled
        this.messageService.add('Restauration non demandée', 'warning', 'USER');
      });

    }
  }

  loadLocalFile(inputFile: any): void {
    this.readLocalFile(inputFile);
  }

  readLocalFile(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadstart = (e) => {
    };
    myReader.onloadend = (e) => {
      this.loadDevoir(myReader.result);
    };
    myReader.onprogress = (e) => {
    };
    myReader.onerror = (e) => {
      this.messageService.add('Echec de l\'ouverture du fichier ' + this.currentFileName + ' !', 'danger', 'USER');
      this.messageService.add(myReader.error.name, 'danger', 'DEV');
      this.currentFileName = '';
    };
    myReader.onabort = (e) => {
      this.messageService.add('Abandon de l\'ouverture du fichier à votre demande !', 'warning', 'USER');
      this.currentFileName = '';
    };

    this.currentFileName = file.name;
    myReader.readAsText(file);
  }

  loadDevoir(content) {
    try {
      // Get content from JSON
      let tmpContent = JSON.parse(content);

      // Migrate content in case of old version
      tmpContent = this.migrateDevoir(tmpContent);

      // Convert JSON content into structured Devoir object
      this.devoir = new Devoir().deserialize(tmpContent);

      this.updateDevoir();

      // Display a succeed message
      this.messageService.add('Devoir chargé avec succès !', 'success', 'USER');

    } catch (e) {
      if (e instanceof SyntaxError) {
        this.messageService.add('Le contenu du fichier n\'est pas conforme.', 'danger', 'USER');
      }
    }
  }

  clearDevoir() {
    this.devoir = new Devoir();
    this.devoir.author = this.configurationService.getValue('author');
    this.devoir.toolVersion = this.toolVersion;
    this.devoir.titre = this.configurationService.getValue('devoirTitreDefault');
    this.devoir.arrondi = parseFloat(this.configurationService.getValue('devoirArrondiDefault'));
    this.devoir.notationMode = parseInt(this.configurationService.getValue('devoirNotationModeDefault'), 10);
    this.devoir.notationCible = parseFloat(this.configurationService.getValue('devoirNotationCibleDefault'));
    this.updateDevoir();
  }

  updateDevoir() {
    let tmpContent = this.devoir.serialize();
    localStorage.setItem('devoir', JSON.stringify(tmpContent));
  }

  saveDevoir() {
    // If this a a new file the the name is computed from date and title
    if (this.currentFileName === '') {
      const titreForFile = this.devoir.titre.replace(/[^a-z0-9]/gi, '');
      if (this.devoir.devoirDate) {
        this.currentFileName = this.devoir.devoirDate.getFullYear() +
          '' + (this.devoir.devoirDate.getMonth() + 1) +
          '' + this.devoir.devoirDate.getDate() +
          '_' + titreForFile + '.json';
      } else {
        this.currentFileName = titreForFile + '.json';
      }
    }

    // Store that new save date
    this.devoir.modificationDate = new Date();

    // Build content according to target JSON format
    let tmpContent = this.devoir.serialize();

    // Transform devoir into JSON string
    const tmpJson = JSON.stringify(tmpContent);

    // Create a download file save as window
    const blob = new Blob([tmpJson], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, this.currentFileName);

    // File do not need anymore to be saved
    this.docIsEdited = false;
    localStorage.removeItem('devoir');

    // Display a succeed message
    this.messageService.add('Devoir sauvegardé avec succès !', 'success', 'USER');
  }


  migrateDevoir(devoirContent: any): any {

    let hasMigration = false;

    // Conversion de la version en chaîne de caractères car avant on était en entier et maintenant c'est une chaîne
    devoirContent.meta.version = devoirContent.meta.version + '';

    // On regarde que la version majeure - la seule qui indique une rupture de compatibilité
    const tmpVersion = devoirContent.meta.version.split('.');
    const majVersion = parseInt(tmpVersion[0], 10);

    // Old conversion to keep in case of
    if (majVersion < 1) {
      this.messageService.add('Migration pour traitement des modes de notation.', 'success', 'DEV');
      devoirContent.data.general.note_arrondi = parseFloat(this.configurationService.getValue('devoirArrondiDefault'));
      devoirContent.data.general.note_final_mode = parseInt(this.configurationService.getValue('devoirNotationModeDefault'), 10);
      devoirContent.data.general.note_final_cible = parseFloat(this.configurationService.getValue('devoirNotationCibleDefault'));

      // Memorize migration operations
      hasMigration = true;
    }

    // Conversion for Angular2 migration
    if (majVersion < 2) {

      // Add new information : the creation date
      devoirContent.meta.date_creation = devoirContent.meta.date_save;

      // New classe and grille management. We just store the current classe and grille (auto-porteur) and not all classes and grilles.
      this.messageService.add('Migration pour traitement du nouveau format sous Angular2.', 'success', 'DEV');
      devoirContent.data.general.classe = {
        id: '_' + devoirContent.data.general.classe,
        titre: devoirContent.data.general.classe,
        eleves: devoirContent.classes['_' + devoirContent.data.general.classe]
      };
      delete devoirContent.classes;

      devoirContent.data.general.grille = {
        id: devoirContent.data.general.grille.id,
        titre: devoirContent.data.general.grille.titre,
        competences: devoirContent.grilles[devoirContent.data.general.grille.id].competences
      };
      delete devoirContent.grilles;

      let tmpCompetences = [];
      for (const keyComp of Object.keys(devoirContent.data.general.grille.competences)) {
        let tmpCompetence = {
          id: keyComp,
          titre: devoirContent.data.general.grille.competences[keyComp].titre,
          couleur: devoirContent.data.general.grille.competences[keyComp].couleur,
          capacites: []
        };
        for (const keyCapa of Object.keys(devoirContent.data.general.grille.competences[keyComp].capacites)) {
          tmpCompetence.capacites.push({
            id: keyCapa,
            texte: devoirContent.data.general.grille.competences[keyComp].capacites[keyCapa]
          });
        }
        tmpCompetences.push(tmpCompetence);
      }
      devoirContent.data.general.grille.competences = tmpCompetences;

      this.messageService.add('Génération des nouveaux identifiants exercices/questions/criteres.', 'success', 'DEV');
      let NumExe = 0;
      let NumQue = 0;
      let NumCri = 0;
      for (const keyExe of Object.keys(devoirContent.data.exercices)) {
        devoirContent.data.exercices[keyExe].id = '' + NumExe;

        if (devoirContent.data.exercices[keyExe].questions) {
          for (const keyQue of Object.keys(devoirContent.data.exercices[keyExe].questions)) {
            devoirContent.data.exercices[keyExe].questions[keyQue].id = NumExe + '_' + NumQue;

            if (devoirContent.data.exercices[keyExe].questions[keyQue].criteres) {
              for (const keyCri of Object.keys(devoirContent.data.exercices[keyExe].questions[keyQue].criteres)) {
                devoirContent.data.exercices[keyExe].questions[keyQue].criteres[keyCri].id = NumExe + '_' + NumQue + '_' + NumCri;
                devoirContent.data.exercices[keyExe].questions[keyQue].criteres[keyCri].capacite =
                  devoirContent.data.exercices[keyExe].questions[keyQue].criteres[keyCri].competence;
                NumCri++;
              }
            }
            NumQue++;
            NumCri = 0;
          }
        }
        NumExe++;
        NumQue = 0;
        NumCri = 0;
      }

      this.messageService.add('Génération des nouvelles structures de notation.', 'success', 'DEV');
      for (const keyEleve of Object.keys(devoirContent.data.notes)) {
        devoirContent.data.notes[keyEleve].eleve = keyEleve;
        devoirContent.data.notes[keyEleve].notes = [];
        for (const keyExe of Object.keys(devoirContent.data.notes[keyEleve].exercices)) {
          const IdExe = keyExe.substr(1);
          for (const keyQue of Object.keys(devoirContent.data.notes[keyEleve].exercices[keyExe].questions)) {
            const idQue = keyQue.substr(1);
            for (const keyCri of Object.keys(devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres)) {
              if (devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('noteStatusEnCours') ||
                devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('Configuration.noteStatusKo') ||
                devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('Configuration.noteStatusOk')) {
                const idCri = keyCri.substr(1);
                devoirContent.data.notes[keyEleve].notes.push({
                  critere: IdExe + '_' + idQue + '_' + idCri,
                  status: devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                });

              } else {
                // On supprime les unknown dont on ne veut pas garder trace
                delete devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri];
              }

            }
          }
        }
      }
      // Memorize migration operations
      hasMigration = true;
    }
    // If a migration occurs then update version in data model and warn user
    if (hasMigration) {
      devoirContent.meta.version = this.toolVersion;
      this.messageService.add(`Une migration des données doit être réalisée.
                               A la fin de la migration, il est conseillé d\'enregistrer le document dans un nouveau fichier.`,
        'warning', 'USER');
      this.docIsEdited = true;
    }

    return devoirContent;
  }

}
