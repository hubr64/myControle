import { Injectable } from '@angular/core';

import * as Configuration from '../_helpers/global';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public storageConfigurationPrefix = Configuration.storagePrefix + Configuration.configurationPrefix;
  public configurationItems: any;

  constructor() {

    // Create configuration and init it from global configuration
    this.configurationItems = {
      storagePrefix: { modifiable: false, value: Configuration.storagePrefix },

      noteStatusOk: { modifiable: false, value: Configuration.noteStatusOk },
      noteStatusEnCours: { modifiable: false, value: Configuration.noteStatusEnCours },
      noteStatusKo: { modifiable: false, value: Configuration.noteStatusKo },
      noteStatusOkCoeff: { modifiable: true, title: 'Coefficient critère acquis', value: Configuration.noteStatusOkCoeff },
      noteStatusEnCoursCoeff: { modifiable: true, title: 'Coefficient critère en cours', value: Configuration.noteStatusEnCoursCoeff },
      noteStatusKoCoeff: { modifiable: true, title: 'Coefficient critère non acquis', value: Configuration.noteStatusKoCoeff },
      notationModeNormal: { modifiable: false, value: Configuration.notationModeNormal },
      notationModeProportionnel: { modifiable: false, value: Configuration.notationModeProportionnel },
      notationModeRapporte: { modifiable: false, value: Configuration.notationModeRapporte },
      notationModeArr: { modifiable: false, value: Configuration.notationModeArr },

      messageDuration: { modifiable: true, title: 'Durée affichage messages', value: Configuration.messageDuration },
      defaultMode: { modifiable: true, title: 'Mode par défaut [edition,notation]', value: Configuration.defaultMode },
      notationDefaultOrder: { modifiable: true, title: 'Ordre affichage par défaut [nom,note]', value: Configuration.notationDefaultOrder },
      notationDefaultNoteMode: { modifiable: true, title: 'Affichage des notes par défaut [brut,ajuste]', value: Configuration.notationDefaultNoteMode },

      author: { modifiable: true, title: 'Auteur des devoirs', value: Configuration.author },
      devoirTitreDefault: { modifiable: true, title: 'Devoir / Titre par défaut', value: Configuration.devoirTitreDefault },
      devoirArrondiDefault: { modifiable: true, title: 'Devoir / Arrondi par défaut', value: Configuration.devoirArrondiDefault },
      devoirNotationModeDefault: { modifiable: true, title: 'Devoir / Mode par défaut', value: Configuration.devoirNotationModeDefault },
      devoirNotationCibleDefault: { modifiable: true, title: 'Devoir / Cible par défaut', value: Configuration.devoirNotationCibleDefault },
      exerciceTitreDefaut: { modifiable: true, title: 'Exercice / Titre par défaut', value: Configuration.exerciceTitreDefaut },
      exerciceNbQuestionDefaut: { modifiable: true, title: 'Exercice / Nb questions par défaut', value: Configuration.exerciceNbQuestionDefaut },
      questionTitreDefaut: { modifiable: true, title: 'Question / Titre par défaut', value: Configuration.questionTitreDefaut },
      questionNbCritereDefaut: { modifiable: true, title: 'Question / Nb critères par défaut', value: Configuration.questionNbCritereDefaut },
      critereTitreDefaut: { modifiable: true, title: 'Critère / Titre par défaut', value: Configuration.critereTitreDefaut },
      critereBaremeDefaut: { modifiable: true, title: 'Critère / Barème par défaut', value: Configuration.critereBaremeDefaut },
      critereFreeDefaut: { modifiable: true, title: 'Texte libre / Texte par défaut', value: Configuration.critereFreeDefaut },
      groupeNomDefaut: { modifiable: true, title: 'Nom de groupe par défaut', value: Configuration.groupeNomDefaut }
    };

    // Load local storage that replace the global initial storage
    this.load();

    // console.dir(this.configurationItems);
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
