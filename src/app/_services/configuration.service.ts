import { Injectable } from '@angular/core';

import * as Configuration from '../_helpers/global';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public storageConfigurationPrefix = Configuration.storagePrefix + Configuration.configurationPrefix;
  public configurationItems: any;
  public categories : string[];

  constructor() {

    // Create categories
    this.categories = ['Général','Devoir','Exercices','Questions','Critères','Textes Libres','Notation','Impression','Avancée' ]
    // Create configuration and init it from global configuration
    this.configurationItems = {
      storagePrefix: { modifiable: false, value: Configuration.storagePrefix },
      noteStatusOk: { modifiable: false, value: Configuration.noteStatusOk },
      noteStatusEnCours: { modifiable: false, value: Configuration.noteStatusEnCours },
      noteStatusKo: { modifiable: false, value: Configuration.noteStatusKo },
      noteStatusOkCoeff: { modifiable: true, title: 'Coefficient critère acquis', value: Configuration.noteStatusOkCoeff, categorie: 'Notation' },
      noteStatusEnCoursCoeff: { modifiable: true, title: 'Coefficient critère en cours', value: Configuration.noteStatusEnCoursCoeff, categorie: 'Notation' },
      noteStatusKoCoeff: { modifiable: true, title: 'Coefficient critère non acquis', value: Configuration.noteStatusKoCoeff, categorie: 'Notation' },
      notationModeNormal: { modifiable: false, value: Configuration.notationModeNormal },
      notationModeProportionnel: { modifiable: false, value: Configuration.notationModeProportionnel },
      notationModeRapporte: { modifiable: false, value: Configuration.notationModeRapporte },
      notationModeArr: { modifiable: false, value: Configuration.notationModeArr },
      messageDuration: { modifiable: true, title: 'Durée affichage messages', value: Configuration.messageDuration, categorie: 'Avancée' },
      autosaveDuration: { modifiable: true, title: 'Enregistrement automatique (secondes)', value: Configuration.autosaveDuration, categorie: 'Avancée' },
      defaultMode: { modifiable: true, title: 'Mode par défaut [edition,notation]', value: Configuration.defaultMode, categorie: 'Général' },
      notationDefaultOrder: { modifiable: true, title: 'Ordre affichage par défaut [nom,note]', value: Configuration.notationDefaultOrder, categorie: 'Général' },
      notationDefaultNoteMode: { modifiable: true, title: 'Affichage des notes par défaut [brut,ajuste]', value: Configuration.notationDefaultNoteMode, categorie: 'Général' },
      author: { modifiable: true, title: 'Auteur par défaut', value: Configuration.author, categorie: 'Devoir'  },
      devoirTitreDefault: { modifiable: true, title: 'Titre par défaut', value: Configuration.devoirTitreDefault, categorie: 'Devoir' },
      devoirArrondiDefault: { modifiable: true, title: 'Arrondi par défaut', value: Configuration.devoirArrondiDefault, categorie: 'Devoir' },
      devoirNotationModeDefault: { modifiable: true, title: 'Mode par défaut [1=Norm,2=Prop,3=Rapp]', value: Configuration.devoirNotationModeDefault, categorie: 'Devoir' },
      devoirNotationCibleDefault: { modifiable: true, title: 'Note cible par défaut', value: Configuration.devoirNotationCibleDefault, categorie: 'Devoir' },
      exerciceTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.exerciceTitreDefaut, categorie: 'Exercices' },
      exerciceNbQuestionDefaut: { modifiable: true, title: 'Nb questions par défaut', value: Configuration.exerciceNbQuestionDefaut, categorie: 'Exercices' },
      questionTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.questionTitreDefaut, categorie: 'Questions' },
      questionNbFreetextDefaut: { modifiable: true, title: 'Nb texte par défaut', value: Configuration.questionNbFreetextDefaut, categorie: 'Questions' },
      questionNbCritereDefaut: { modifiable: true, title: 'Nb critères par défaut', value: Configuration.questionNbCritereDefaut, categorie: 'Questions' },
      critereTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.critereTitreDefaut, categorie: 'Critères' },
      critereBaremeDefaut: { modifiable: true, title: 'Barème par défaut', value: Configuration.critereBaremeDefaut, categorie: 'Critères' },
      critereFreeDefaut: { modifiable: true, title: 'Texte par défaut', value: Configuration.critereFreeDefaut, categorie: 'Textes Libres' },
      groupeNomDefaut: { modifiable: true, title: 'Nom de groupe par défaut', value: Configuration.groupeNomDefaut, categorie: 'Notation' },
      impressionMargeExercice: { modifiable: true, title: 'Espace avant exercice', value: Configuration.impressionMargeExercice, categorie: 'Impression' },
      impressionMargeQuestion: { modifiable: true, title: 'Espace avant question', value: Configuration.impressionMargeQuestion, categorie: 'Impression' }

    };

    // Load local storage that replace the global initial storage
    this.load();
  }

  load() {
    for (let [key, value] of Object.entries(this.configurationItems)) {
      const tmpDevoir = localStorage.getItem(this.storageConfigurationPrefix + key);
      if (tmpDevoir) {
        this.configurationItems[key].value = tmpDevoir;
      }
    }
  }

  getValue(index) {
    return this.configurationItems[index].value;
  }

  setValue(index, value) {
    if (this.configurationItems[index]) {
      this.configurationItems[index].value = value;
      localStorage.setItem(this.storageConfigurationPrefix + index, value);
    }
  }

  initValue(index) {
    if (this.configurationItems[index]) {
      localStorage.removeItem(this.storageConfigurationPrefix + index);
      this.configurationItems[index].value = Configuration[index];
    }
  }


}
