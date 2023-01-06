'use strict';

export const CONFIG: { [key: string]: any } = {
  "storagePrefix": 'mycontrole-',
  "configurationPrefix": 'config-',
  "noteStatusOk": 'ok',
  "noteStatusEnCours": 'encours',
  "noteStatusKo": 'ko',
  "noteStatusOkCoeff": 1,
  "noteStatusEnCoursCoeff": 0.5,
  "noteStatusKoCoeff": 0,
  "notationModeNormal":{
    id: 1,
    titre: 'Normal',
    description: 'La note du devoir reste en l\'état.'
  },
  "notationModeProportionnel":{
    id: 2,
    titre: 'Proportionnel',
    description: `La note du devoir est proportionelle à la note cible
                  (un élève qui a 18/22 avec une cible à 20 aura 16,4/20).`
  },
  "notationModeRapporte":{
    id: 3,
    titre: 'Rapporté',
    description: `La note du devoir est ramenée sur la note cible
                  (un élève qui a 22/22 avec une cible a 20 aura 20/20,
                  un élève qui a 12/22 avec une cible à 20 aura 12/20).`
  },
  "messageDuration": 5000,
  "autosaveDuration": 60,
  "defaultMode": 'edition',
  "notationDefaultOrder": 'nom',
  "notationDefaultNoteMode": 'brut',
  "author": 'MARTIN-DEIDIER',
  "devoirTitreDefault": 'Titre du devoir',
  "devoirArrondiDefault": 0.5,
  "devoirNotationModeDefault": 1,
  "devoirNotationCibleDefault": 20,
  "exerciceTitreDefaut": 'Exercice x - Titre de l\'exercice',
  "exerciceNbQuestionDefaut": 1,
  "questionTitreDefaut": 'Question x - Intitulé de la question',
  "questionNbCritereDefaut": 1,
  "critereTitreDefaut": 'Définition du critère...',
  "critereBaremeDefaut": 0,
  "critereFreeDefaut": 'Texte libre...',
  "questionNbFreetextDefaut": 1,
  "groupeNomDefaut": 'Groupe n° ',
  "impressionMargeExercice": 50,
  "impressionMargeQuestion": 10
};