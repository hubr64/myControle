import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Devoir } from '../_models/devoir';
import { Grille } from '../_models/grille';
import { Classe } from '../_models/classe';
import { Exercice } from '../_models/exercice';
import { Freetext } from '../_models/freetext';
import { Notation } from '../_models/notation';
import { Critere } from '../_models/critere';

import { MessageService } from './message.service';
import { GrilleService } from './grille.service';
import { ClasseService } from './classe.service';
import { ConfigurationService } from './configuration.service';

import { ModalConfirmRestoreDevoirComponent } from '../modal-confirm-restore-devoir/modal-confirm-restore-devoir.component';
import { ModalCheckDevoirComponent } from '../modal-check-devoir/modal-check-devoir.component';

import { saveAs } from 'file-saver';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevoirService {

  public currentFileName = '';
  public toolVersion = environment.appVersion;

  public docIsEdited = false;
  public oldDevoir = '';
  public devoir;
  public noteCoeffs = [];

  public devoirStoragePrefix: string;
  public devoirDateStoragePrefix: string;

  public loadNewDevoirSub = new Subject<boolean>();

  constructor(
    public messageService: MessageService,
    public grilleService: GrilleService,
    public classeService: ClasseService,
    public configurationService: ConfigurationService,
    public modalService: NgbModal) {

    const autosaveDuration = this.configurationService.getValue('autosaveDuration');
    const noteStatusOkCoeff = this.configurationService.getValue('noteStatusOkCoeff');
    const noteStatusEnCoursCoeff = this.configurationService.getValue('noteStatusEnCoursCoeff');
    const noteStatusKoCoeff = this.configurationService.getValue('noteStatusKoCoeff');
    const noteStatusOk = this.configurationService.getValue('noteStatusOk');
    const noteStatusEnCours = this.configurationService.getValue('noteStatusEnCours');
    const noteStatusKo = this.configurationService.getValue('noteStatusKo');

    this.noteCoeffs[noteStatusOk] = noteStatusOkCoeff;
    this.noteCoeffs[noteStatusEnCours] = noteStatusEnCoursCoeff;
    this.noteCoeffs[noteStatusKo] = noteStatusKoCoeff;

    this.devoirStoragePrefix = this.configurationService.getValue('storagePrefix') + 'devoir-';
    this.devoirDateStoragePrefix = this.configurationService.getValue('storagePrefix') + 'devoir-date-';

    const tmpDevoir = localStorage.getItem(this.devoirStoragePrefix);
    const tmpDevoirDate = localStorage.getItem(this.devoirDateStoragePrefix);
    if (this.devoir === undefined && tmpDevoir) {

      // Display modal window to ask user for confirmation
      const modalRef = this.modalService.open(ModalConfirmRestoreDevoirComponent, { centered: true });
      // @ts-ignore: Provide it the devoir to restore
      modalRef.componentInstance.devoir = tmpDevoir;
      // @ts-ignore: Provide it the devoir to restore
      modalRef.componentInstance.devoirDate = tmpDevoirDate;

      // Manage answer of the user
      modalRef.result.then((result) => {
        // If user confirms thus restore the devoir
        this.loadDevoir(tmpDevoir);
        // State that the devoir is edtited and should be saved
        this.docIsEdited = true;
      }, (reason) => {
        // Restoration is cancelled
        this.messageService.add('Restauration non demandée', 'warning', 'USER');
      });
    }

    // Lance le processus de surveillance de modifications sur le devoir
    setInterval(() => this.doCheck(), autosaveDuration * 1000);

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
    if (this.docIsEdited === false ||
      (this.docIsEdited === true &&
        confirm('Le devoir actuel n\'est pas sauvegardé. Êtes-vous sûr de vouloir continuer (le travail non sauvegardé sera perdu) ? '))) {
      try {
        // Get content from JSON
        let tmpContent = JSON.parse(content);

        // Migrate content in case of old version
        tmpContent = this.migrateDevoir(tmpContent);

        // Convert JSON content into structured Devoir object
        this.devoir = new Devoir().deserialize(tmpContent);
        this.devoir.notes_coefficients = this.noteCoeffs;

        // Init information to check for devoir change detection
        this.oldDevoir = JSON.stringify(this.devoir);
        this.docIsEdited = false;

        // Display a succeed message
        this.messageService.add('Devoir chargé avec succès !', 'success', 'USER');

        // Send information to every subscribers
        this.loadNewDevoirSub.next(true);

      } catch (e) {
        if (e instanceof SyntaxError) {
          this.messageService.add('Le contenu du fichier n\'est pas conforme.', 'danger', 'USER');
        }
      }
    }
  }

  clearDevoir() {
    if (this.docIsEdited === false ||
      (this.docIsEdited === true &&
        confirm('Le devoir actuel n\'est pas sauvegardé. Êtes-vous sûr de vouloir continuer (le travail non sauvegardé sera perdu) ? '))) {

      // Create the new devoir
      this.devoir = new Devoir();
      this.devoir.author = this.configurationService.getValue('author');
      this.devoir.toolVersion = this.toolVersion;
      this.devoir.titre = this.configurationService.getValue('devoirTitreDefault');
      this.devoir.arrondi = parseFloat(this.configurationService.getValue('devoirArrondiDefault'));
      this.devoir.notationMode = parseInt(this.configurationService.getValue('devoirNotationModeDefault'), 10);
      this.devoir.notationCible = parseFloat(this.configurationService.getValue('devoirNotationCibleDefault'));
      this.devoir.notes_coefficients = this.noteCoeffs;

      // Prepare information to check for devoir change detection
      this.oldDevoir = JSON.stringify(this.devoir);
      this.docIsEdited = false;

      // Send information to every subscribers
      this.loadNewDevoirSub.next(true);
    }
  }

  doCheck() {
    // Convert to JSON to prevent shadow copy
    let currentDevoir = JSON.stringify(this.devoir);
    // Remove the modification date that is by definition not to take into account
    const modificationDateRegex = /,"modificationDate":"[^"]*"/gi; // ,"modificationDate":"2020-01-15T17:05:12.362Z",
    currentDevoir = currentDevoir.replace(modificationDateRegex, '');
    this.oldDevoir = this.oldDevoir.replace(modificationDateRegex, '');
    // If the deep copies are different then we should warn user
    if (currentDevoir !== this.oldDevoir) {
      console.log('Modification détectée.');
      this.updateDevoir();
      this.oldDevoir = currentDevoir;
    }
  }

  updateDevoir() {
    // State that the devoir is edited and should be saved
    setTimeout(() => {
      this.docIsEdited = true;
    });

    // Store it in local storage to avoid lost
    let tmpContent = this.devoir.serialize();
    localStorage.setItem(this.devoirStoragePrefix, JSON.stringify(tmpContent));
    localStorage.setItem(this.devoirDateStoragePrefix, JSON.stringify(new Date()));
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
    localStorage.removeItem(this.devoirStoragePrefix);
    localStorage.removeItem(this.devoirDateStoragePrefix);

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
      let tmpNotations = [];
      for (const keyEleve of Object.keys(devoirContent.data.notes)) {
        let tmpNotation = {
          eleve: keyEleve,
          notes: [],
          commentaire: devoirContent.data.notes[keyEleve].commentaire
        };
        for (const keyExe of Object.keys(devoirContent.data.notes[keyEleve].exercices)) {
          const IdExe = keyExe.substr(1);
          for (const keyQue of Object.keys(devoirContent.data.notes[keyEleve].exercices[keyExe].questions)) {
            const idQue = keyQue.substr(1);
            for (const keyCri of Object.keys(devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres)) {
              if (devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('noteStatusEnCours') ||
                devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('noteStatusKo') ||
                devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                === this.configurationService.getValue('noteStatusOk')) {
                const idCri = keyCri.substr(1);
                tmpNotation.notes.push({
                  critere: IdExe + '_' + idQue + '_' + idCri,
                  status: devoirContent.data.notes[keyEleve].exercices[keyExe].questions[keyQue].criteres[keyCri].state
                });
              }
            }
          }
        }
        tmpNotations.push(tmpNotation);
      }
      delete devoirContent.data.notes;
      devoirContent.data.notations = tmpNotations;

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

  getImpactedCriteres(removedCapacites) {
    let impactedCriteres = removedCapacites;

    if (removedCapacites.length > 0) {
      removedCapacites.forEach((removedCapacite, indexCapa) => {
        for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
          if (exercice.questions) {
            for (const [indexQue, question] of exercice.questions.entries()) {
              if (question.criteres) {
                for (const [indexCri, critere] of question.criteres.entries()) {
                  if (critere.capacite && critere.capacite.id === removedCapacite.capacite.id) {
                    removedCapacite.criteres++;
                  }
                }
              }
            }
          }
        }
      });
    }
    return impactedCriteres;
  }

  getImpactedNotations(removedEleves) {
    let impactedNotations = removedEleves;
    if (removedEleves.length > 0) {
      removedEleves.forEach((removedEleve, indexEleve) => {
        for (const [indexNotation, notation] of this.devoir.notations.entries()) {
          if (notation.eleve === removedEleve.eleve) {
            removedEleve.notation = true;
          }
        }
      });
    }
    return impactedNotations;
  }

  replaceGrille(newGrille: Grille) {
    // Definitions diverses
    let capacitesRemplaces = 0;
    let capacitesSupprimes = 0;

    // On remplace les criteres qui ont le même identifiant et on annule les autres
    for (const [indexExe, exercice] of this.devoir.exercices.entries()) {
      if (exercice.questions) {
        for (const [indexQue, question] of exercice.questions.entries()) {
          if (question.criteres) {
            for (const [indexCri, critere] of question.criteres.entries()) {
              if (critere.capacite && critere.capacite.id) {
                const newCapacite = newGrille.getCapacite(critere.capacite.id);
                if (newCapacite) {
                  critere.capacite = newCapacite;
                  capacitesRemplaces++;
                } else {
                  critere.capacite = null;
                  capacitesSupprimes++;
                }
              }
            }
          }
        }
      }
    }

    // Replacement is now finished then display a confirmation
    this.messageService.add(
      'Remplacement de la grille terminé (' +
      capacitesRemplaces + ' critères avec capacités remplacées / ' +
      capacitesSupprimes + ' critères avec capacités supprimées)', 'success', 'USER');

    // On remplace l'ancienne grille par la nouvelle
    this.devoir.grille = newGrille;
  }

  replaceClasse(newClasse: Classe) {
    // Définitions diverses
    let elevesRemplaces = 0;
    let elevesSupprimes = 0;

    // On laisse les noms d'élève qui existe toujours et on supprime les notations des éleves qui n'existe plus
    for (const [indexNot, notation] of this.devoir.notations.entries()) {
      // L'élève n'existe pas
      if (newClasse.eleves.indexOf(notation.eleve) === -1) {
        this.devoir.notations.splice(notation, 1);
        elevesSupprimes++;
      } else {
        // On ne fait rien si l'élève existe toujours
        elevesRemplaces++;
      }
    }

    // Replacement is now finished then display a confirmation
    this.messageService.add(
      'Remplacement de la classe terminé (' +
      elevesRemplaces + ' élèves avec notation remplacée / ' +
      elevesSupprimes + ' élèves avec notation supprimée)', 'success', 'USER');

    // On remplace l'ancienne classe par la nouvelle
    this.devoir.classe = newClasse;
  }

  chooseCapacite(critere: Critere) {
    // No grille defined then can assigned a new one
    if (this.devoir.grille === null) {
      this.messageService.add('Aucune grille de compétences n\'est asscoiée au devoir. Impossible de choisir un capacité.', 'warning', 'USER');
    } else {
      this.grilleService.showGrille(this.devoir.grille, true, this.devoir);
      this.grilleService.selectedCapaciteSub.subscribe((selectedCapacite) => {
        if (selectedCapacite !== null) {
          critere.capacite = selectedCapacite;
        } else {
          critere.capacite = null;
          this.messageService.add('La capacité a bien été retirée du critère.', 'success', 'USER');
        }
      });
    }
  }

  checkDevoir() {
    // Display modal window to disaply check results
    const modalRef = this.modalService.open(ModalCheckDevoirComponent, { centered: true, size: 'xl', scrollable: true });
    // @ts-ignore: Provide the devoir
    modalRef.componentInstance.devoir = this.devoir;

    // Manage answer of the user
    modalRef.result.then((result) => {

    }, (reason) => {

    });

  }

}
