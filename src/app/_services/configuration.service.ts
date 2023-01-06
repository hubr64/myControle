import { Injectable } from '@angular/core';

import * as Configuration from '../_helpers/global';
import { environment } from '../../environments/environment';

export interface ConfigurationItemType {
  modifiable: boolean;
  value: any;
  title: string;
  categorie: string;
}
export interface ConfigurationItemsType {
  [id: string]: ConfigurationItemType
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public storageConfigurationPrefix = Configuration.CONFIG["storagePrefix"] + Configuration.CONFIG["configurationPrefix"];
  public configurationItems: ConfigurationItemsType;
  public categories : string[];

  constructor() {

    // Create categories
    this.categories = ['Général','Devoir','Exercices','Questions','Critères','Textes Libres','Notation','Impression','Avancée' ]
    // Create configuration and init it from global configuration
    this.configurationItems = {
      storagePrefix: { modifiable: false, value: Configuration.CONFIG["storagePrefix"], title: '', categorie: '' },
      noteStatusOk: { modifiable: false, value: Configuration.CONFIG["noteStatusOk"], title: '', categorie: '' },
      noteStatusEnCours: { modifiable: false, value: Configuration.CONFIG["noteStatusEnCours"], title: '', categorie: '' },
      noteStatusKo: { modifiable: false, value: Configuration.CONFIG["noteStatusKo"], title: '', categorie: '' },
      noteStatusOkCoeff: { modifiable: true, title: 'Coefficient critère acquis', value: Configuration.CONFIG["noteStatusOkCoeff"], categorie: 'Notation' },
      noteStatusEnCoursCoeff: { modifiable: true, title: 'Coefficient critère en cours', value: Configuration.CONFIG["noteStatusEnCoursCoeff"], categorie: 'Notation' },
      noteStatusKoCoeff: { modifiable: true, title: 'Coefficient critère non acquis', value: Configuration.CONFIG["noteStatusKoCoeff"], categorie: 'Notation' },
      notationModeNormal: { modifiable: false, value: Configuration.CONFIG["notationModeNormal"], title: '', categorie: '' },
      notationModeProportionnel: { modifiable: false, value: Configuration.CONFIG["notationModeProportionnel"], title: '', categorie: '' },
      notationModeRapporte: { modifiable: false, value: Configuration.CONFIG["notationModeRapporte"], title: '', categorie: '' },
      notationModeArr: { modifiable: false, value: Configuration.CONFIG["notationModeArr"], title: '', categorie: '' },
      messageDuration: { modifiable: true, title: 'Durée affichage messages', value: Configuration.CONFIG["messageDuration"], categorie: 'Avancée' },
      autosaveDuration: { modifiable: true, title: 'Enregistrement automatique (secondes)', value: Configuration.CONFIG["autosaveDuration"], categorie: 'Avancée' },
      defaultMode: { modifiable: true, title: 'Mode par défaut [edition,notation]', value: Configuration.CONFIG["defaultMode"], categorie: 'Général' },
      notationDefaultOrder: { modifiable: true, title: 'Ordre affichage par défaut [nom,note]', value: Configuration.CONFIG["notationDefaultOrder"], categorie: 'Général' },
      notationDefaultNoteMode: { modifiable: true, title: 'Affichage des notes par défaut [brut,ajuste]', value: Configuration.CONFIG["notationDefaultNoteMode"], categorie: 'Général' },
      author: { modifiable: true, title: 'Auteur par défaut', value: Configuration.CONFIG["author"], categorie: 'Devoir'  },
      devoirTitreDefault: { modifiable: true, title: 'Titre par défaut', value: Configuration.CONFIG["devoirTitreDefault"], categorie: 'Devoir' },
      devoirArrondiDefault: { modifiable: true, title: 'Arrondi par défaut', value: Configuration.CONFIG["devoirArrondiDefault"], categorie: 'Devoir' },
      devoirNotationModeDefault: { modifiable: true, title: 'Mode par défaut [1=Norm,2=Prop,3=Rapp]', value: Configuration.CONFIG["devoirNotationModeDefault"], categorie: 'Devoir' },
      devoirNotationCibleDefault: { modifiable: true, title: 'Note cible par défaut', value: Configuration.CONFIG["devoirNotationCibleDefault"], categorie: 'Devoir' },
      exerciceTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.CONFIG["exerciceTitreDefaut"], categorie: 'Exercices' },
      exerciceNbQuestionDefaut: { modifiable: true, title: 'Nb questions par défaut', value: Configuration.CONFIG["exerciceNbQuestionDefaut"], categorie: 'Exercices' },
      questionTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.CONFIG["questionTitreDefaut"], categorie: 'Questions' },
      questionNbFreetextDefaut: { modifiable: true, title: 'Nb texte par défaut', value: Configuration.CONFIG["questionNbFreetextDefaut"], categorie: 'Questions' },
      questionNbCritereDefaut: { modifiable: true, title: 'Nb critères par défaut', value: Configuration.CONFIG["questionNbCritereDefaut"], categorie: 'Questions' },
      critereTitreDefaut: { modifiable: true, title: 'Titre par défaut', value: Configuration.CONFIG["critereTitreDefaut"], categorie: 'Critères' },
      critereBaremeDefaut: { modifiable: true, title: 'Barème par défaut', value: Configuration.CONFIG["critereBaremeDefaut"], categorie: 'Critères' },
      critereFreeDefaut: { modifiable: true, title: 'Texte par défaut', value: Configuration.CONFIG["critereFreeDefaut"], categorie: 'Textes Libres' },
      groupeNomDefaut: { modifiable: true, title: 'Nom de groupe par défaut', value: Configuration.CONFIG["groupeNomDefaut"], categorie: 'Notation' },
      impressionMargeExercice: { modifiable: true, title: 'Espace avant exercice', value: Configuration.CONFIG["impressionMargeExercice"], categorie: 'Impression' },
      impressionMargeQuestion: { modifiable: true, title: 'Espace avant question', value: Configuration.CONFIG["impressionMargeQuestion"], categorie: 'Impression' }

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

  getValue(index: string) {
    return this.configurationItems[index].value;
  }

  setValue(index: string, value: string) {
    if (this.configurationItems[index]) {
      this.configurationItems[index].value = value;
      localStorage.setItem(this.storageConfigurationPrefix + index, value);
    }
  }

  initValue(index: any) {
    if (this.configurationItems[index]) {
      localStorage.removeItem(this.storageConfigurationPrefix + index);
      this.configurationItems[index].value = Configuration.CONFIG[index];
    }
  }


}
