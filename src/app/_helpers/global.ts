'use strict';

export const storagePrefix = 'mycontrole-';
export const configurationPrefix = 'config-';

export const noteStatusOk = 'ok';
export const noteStatusEnCours = 'encours';
export const noteStatusKo = 'ko';
export const noteStatusOkCoeff = 1;
export const noteStatusEnCoursCoeff = 0.5;
export const noteStatusKoCoeff = 0;
export const notationModeNormal = {
  id: 1,
  titre: 'Normal',
  description: 'La note du devoir reste en l\'état.'
};
export const notationModeProportionnel = {
  id: 2,
  titre: 'Proportionnel',
  description: `La note du devoir est proportionelle à la note cible
                (un élève qui a 18/22 avec une cible à 20 aura 16,4/20).`
};
export const notationModeRapporte = {
  id: 3,
  titre: 'Rapporté',
  description: `La note du devoir est ramenée sur la note cible
                (un élève qui a 22/22 avec une cible a 20 aura 20/20,
                un élève qui a 12/22 avec une cible à 20 aura 12/20).`
};
export const notationModeArr = [notationModeNormal, notationModeProportionnel, notationModeRapporte];

export const messageDuration = 5000;
export const defaultMode = 'edition';
export const notationDefaultOrder = 'nom';
export const notationDefaultNoteMode = 'brut';

export const author = 'MARTIN-DEIDIER';
export const devoirTitreDefault = 'Titre du devoir';
export const devoirArrondiDefault = 0.5;
export const devoirNotationModeDefault = 1;
export const devoirNotationCibleDefault = 20;
export const exerciceTitreDefaut = 'Exercice x - Titre de l\'exercice';
export const exerciceNbQuestionDefaut = 1;
export const questionTitreDefaut = 'Question x - Intitulé de la question';
export const questionNbCritereDefaut = 1;
export const critereTitreDefaut = 'Définition du critère...';
export const critereBaremeDefaut = 0;
export const critereFreeDefaut = 'Texte libre...';
export const groupeNomDefaut = 'Groupe n° ';
