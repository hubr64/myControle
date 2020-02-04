import { Component, OnInit, Input } from '@angular/core';
import { HostListener } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { BlurEvent, FocusEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { DevoirService } from '../_services/devoir.service';
import { ConfigurationService } from '../_services/configuration.service';
import { Notation } from '../_models/notation';
import { Critere } from '../_models/critere';
import { Note } from '../_models/note';
import { Groupe } from '../_models/groupe';

@Component({
  selector: 'app-modal-eleve-notation',
  templateUrl: './modal-eleve-notation.component.html',
  styleUrls: ['./modal-eleve-notation.component.sass']
})
export class ModalEleveNotationComponent implements OnInit {

  @Input() public notation: Notation = null;
  @Input() public groupe: Groupe = null;
  @Input() public eleve: string = null;
  @Input() public notationMode = null;

  public noteStatusOk = '';
  public noteStatusEnCours = '';
  public noteStatusKo = '';

  public critereEvalue: Critere = null;
  public critereEvaluePos = null;
  public criteres = [];

  public fontSizeDisplay = 12;

  public displayCommentaire = false;
  public editor = InlineEditor;
  public editorIsFocused = false;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    // on ne capture le clavier que si on note les criteres pas avant
    if (this.notation) {
      // On ne capture pas le clavier si l'utilisateur est en train de rédiger le commentaire
      if (this.editorIsFocused === false) {

        // Capture des déplacements entre criteres
        if (event.key === 'ArrowUp') {
          this.onKeyUp();
          document.getElementById(this.critereEvalue.id).scrollIntoView();
        }
        if (event.key === 'ArrowDown') {
          this.onKeyDown();
          document.getElementById(this.critereEvalue.id).scrollIntoView();
        }
        // C apture des notations de criteres
        if (event.key === '0' || event.key === '1' || event.key === '2' || event.key === '3') {
          this.onChangeStatut(event.key);
          document.getElementById(this.critereEvalue.id).scrollIntoView();
        }
        // Pour eviter tout effet de bord on ne laisse pas se propager les saisies claviers
        event.stopPropagation();
        event.preventDefault();
      }
      // Que l'utilisateur édite son commentaire ou qu'il soit en train d'évaluer les critères, la tabulation passe à une évaluation suivante
      if (event.key === 'Tab' && this.notationMode === 'multi') {
        this.nextNotation();
      }
    }
  }

  constructor(
    private devoirService: DevoirService,
    private configurationService: ConfigurationService,
    private modal: NgbActiveModal) {
    this.notation = null;
    this.eleve = null;
    this.groupe = null;
    this.noteStatusOk = this.configurationService.getValue('noteStatusOk');
    this.noteStatusEnCours = this.configurationService.getValue('noteStatusEnCours');
    this.noteStatusKo = this.configurationService.getValue('noteStatusKo');
    this.displayCommentaire = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.notationMode) {
      // Des que tout est pret on charge la liste des criteres concernés
      this.criteres = [];
      for (const [indexExe, exercice] of this.devoirService.devoir.exercices.entries()) {
        if (this.devoirService.devoir.exercices[indexExe].questions) {
          for (const [indexQue, question] of this.devoirService.devoir.exercices[indexExe].questions.entries()) {
            if (this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres) {
              for (const [indexCri, critere] of this.devoirService.devoir.exercices[indexExe].questions[indexQue].criteres.entries()) {
                if (critere.constructor.name === 'Critere') {
                  this.criteres.push(critere);
                }
              }
            }
          }
        }
      }

      // Si au chargement on fournit un élève alors on doit gérer en cherchant sa notation
      if (this.eleve) {
        this.openNotation(this.eleve);
      } else {
        // Si au chargement on fournit un groupe alors la notation utilisée sera
        if (this.groupe) {
          this.openNotationForGroupe();
        } else {
          // Si une notation est fournit dès le début alors on définit tout de suite le premier critère à évaluer
          if (this.notation) {
            this.setPremierCritereEvalue();
          }
        }
      }
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  setPremierCritereEvalue() {
    // Si une note existe déjà, le premier critère affiché sera celui de la dernière note évaluée
    if (this.notation.notes.length > 0) {
      this.critereEvalue = this.notation.notes[this.notation.notes.length - 1].critere;
      this.critereEvaluePos = this.criteres.indexOf(this.critereEvalue);
      // Si aucune note alors on prend le premier du devoir
    } else {
      this.critereEvalue = this.criteres[0];
      this.critereEvaluePos = 0;
    }
    // Move viewport to selected criteria
    setTimeout(() => {
      document.getElementById(this.critereEvalue.id).focus();
      document.getElementById(this.critereEvalue.id).scrollIntoView();
    }, 200);
  }

  // Création d'une nouvelle note pour la notation en cours
  createNote(noteStatus: string, critere: Critere): Note {
    const newNote = new Note();
    newNote.status = noteStatus; // selon status fourni
    newNote.critere = critere; // Selon critère fourni
    newNote.noteCoeffs = this.devoirService.devoir.noteCoeffs; // Les coeffs sont ceuxw du devoir
    return newNote;
  }

  // Changement d'état du critère à chaque clic (boucle circuleaire entre les différents états)
  toggleCritere(critere: Critere) {
    // Dans  un premier temps on change le critère s'il est différent de l'actuel
    this.critereEvalue = critere;
    this.critereEvaluePos = this.criteres.indexOf(critere);

    // on cherche la notation dans le devoir (car on veut modifier le devoir et pas la notation dans la fenêtre)
    /*for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        let critereFound = false;
        for (const note of notation.notes) {
          if (note.critere === this.critereEvalue) {
            // Si trouvé on bascule la nouvelle status en fonction de l'actuel (cyclique)
            critereFound = true;
            switch (note.status) {
              case null:
                note.status = this.noteStatusKo;
                break;
              case this.noteStatusKo:
                note.status = this.noteStatusEnCours;
                break;
              case this.noteStatusEnCours:
                note.status = this.noteStatusOk;
                break;
              case this.noteStatusOk:
                note.status = null;
                break;
            }
          }
        }
        // Si le note n'a pas été trouvé alors on en créé une nouvelle à l'état KO (premier état en cas de clic suivant un état non défini)
        if (critereFound === false) {
          notation.notes.push(this.createNote(this.noteStatusKo, this.critereEvalue));
        }
      }
    }*/
    let critereFound = false;
    for (const note of this.notation.notes) {
      if (note.critere === this.critereEvalue) {
        // Si trouvé on bascule la nouvelle status en fonction de l'actuel (cyclique)
        critereFound = true;
        switch (note.status) {
          case null:
            note.status = this.noteStatusKo;
            break;
          case this.noteStatusKo:
            note.status = this.noteStatusEnCours;
            break;
          case this.noteStatusEnCours:
            note.status = this.noteStatusOk;
            break;
          case this.noteStatusOk:
            note.status = null;
            break;
        }
      }
    }
    // Si le note n'a pas été trouvé alors on en créé une nouvelle à l'état KO (premier état en cas de clic suivant un état non défini)
    if (critereFound === false) {
      this.notation.notes.push(this.createNote(this.noteStatusKo, this.critereEvalue));
    }

    // Si c'est un groupe on doit réaliser l'oépration pour tous les élèves du groupe
    if (this.groupe) {
      this.duplicateGroupeToEleves();
    }
  }

  // Changemùent du status sur saisie clavier (0, 1, 2 ou 3)
  onChangeStatut(statut: string) {
    // Compute new state according to key pressed
    let newStatus = '';
    switch (statut) {
      case '1':
        newStatus = this.noteStatusKo;
        break;
      case '2':
        newStatus = this.noteStatusEnCours;
        break;
      case '3':
        newStatus = this.noteStatusOk;
        break;
      case '0':
        newStatus = null;
        break;
    }

    // on cherche la notation dans le devoir (car on veut modifier le devoir et pas la notation dans la fenêtre)
    /*
    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        let critereFound = false;
        for (const note of notation.notes) {
          if (note.critere === this.critereEvalue) {
            // Si trouvé on applique le nouveau status
            critereFound = true;
            note.status = newStatus;
          }
        }
        // SI pas trouvé on créé la ouvelle note avec le nouveau status
        if (critereFound === false && newStatus !== null) {
          notation.notes.push(this.createNote(newStatus, this.critereEvalue));
        }
      }
    }*/
    let critereFound = false;
    for (const note of this.notation.notes) {
      if (note.critere === this.critereEvalue) {
        // Si trouvé on applique le nouveau status
        critereFound = true;
        note.status = newStatus;
      }
    }
    // SI pas trouvé on créé la ouvelle note avec le nouveau status
    if (critereFound === false && newStatus !== null) {
      this.notation.notes.push(this.createNote(newStatus, this.critereEvalue));
    }

    // Si c'est un groupe on doit réaliser l'oépration pour tous les élèves du groupe
    if (this.groupe) {
      this.duplicateGroupeToEleves();
    }

    // Une fois le nouveau status appliqué on passe au critère suivant
    if (this.critereEvaluePos !== this.criteres.length - 1) {
      this.onKeyDown();
    } else {
      // Si pas de critère suivant (on est à la fin) alors on affiche le commentaire (petit gain de temps)
      this.displayCommentaire = true;
    }
  }

  // Passage au critère précédent
  onKeyUp() {
    if (this.critereEvalue && this.critereEvaluePos) {
      this.critereEvaluePos--;
      // Si on était au tout début alors on passe tout à la fin
      if (this.critereEvaluePos === 0) {
        this.critereEvaluePos = this.criteres.length - 1;
      }
      this.critereEvalue = this.criteres[this.critereEvaluePos];
    }
  }

  // Passage au critère suivant
  onKeyDown() {
    if (this.critereEvalue) {
      this.critereEvaluePos++;
      // Si on était au à la tute fin alors on passe tout au début
      if (this.critereEvaluePos === this.criteres.length) {
        this.critereEvaluePos = 0;
      }
      this.critereEvalue = this.criteres[this.critereEvaluePos];
    }
  }

  // Tous les critères sont validés (supprime tout puis recréér tou à OK)
  acceptAllCriteres() {
    /*for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
        for (const critere of this.criteres) {
          notation.notes.push(this.createNote(this.noteStatusOk, critere));
        }
      }
    }*/
    this.notation.notes = [];
    for (const critere of this.criteres) {
      this.notation.notes.push(this.createNote(this.noteStatusOk, critere));
    }

    // Si c'est un groupe il faut également faire la manipulation pour tous les élèves du groupe
    if (this.groupe) {
      this.duplicateGroupeToEleves();
    }
  }

  // Tous les critères sont refusés (supprime tout puis recréé tou à ko)
  denyAllCriteres() {
    /*for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
        for (const critere of this.criteres) {
          notation.notes.push(this.createNote(this.noteStatusKo, critere));
        }
      }
    }*/
    this.notation.notes = [];
    for (const critere of this.criteres) {
      this.notation.notes.push(this.createNote(this.noteStatusKo, critere));
    }

    // Si c'est un groupe il faut également faire la manipulation pour tous les élèves du groupe
    if (this.groupe) {
      this.duplicateGroupeToEleves();
    }
  }

  // Tous les critères sont supprimés (permet de refaire la notation car tout passe à indéfini)
  deleteAllCriteres() {
    /*for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
      }
    }*/
    this.notation.notes = [];

    // Si c'est un groupe il faut également faire la manipulation pour tous les élèves du groupe
    if (this.groupe) {
      this.duplicateGroupeToEleves();
    }
  }

  // Affiche ou masque la zone de commentaire
  toggleCommentaire() {
    this.displayCommentaire = !this.displayCommentaire;
  }
  public onReadyEditor(editor) {
    editor.editing.view.focus();
    this.editorIsFocused = true;
  }
  public onBlurEditor({ editor }: BlurEvent) {
    this.editorIsFocused = false;
    this.duplicateGroupeToEleves();
  }
  public onFocusEditor({ editor }: FocusEvent) {
    this.editorIsFocused = true;
  }

  // On change le zoom en agissant sur la police d'affichage
  changeZoom(offset: number) {
    this.fontSizeDisplay = this.fontSizeDisplay + offset;
  }

  // Quand un élève est choisi alors on définit la notation pour cet élève (soit elle existe soit elle doit être créé)
  openNotation(eleve: string) {
    // First check if the notation is not already existing
    this.notation = this.devoirService.devoir.getEleveNotation(eleve);

    // If not existing then create a new one and append it in the devoir
    if (this.notation === null) {
      let newNotation = new Notation();
      newNotation.eleve = eleve;
      newNotation.commentaire = '';
      newNotation.notes = [];
      newNotation.notes_coefficients = this.devoirService.devoir.noteCoeffs;

      this.notation = newNotation;
      this.devoirService.devoir.notations.push(this.notation);
    }
    // Begin edition
    this.setPremierCritereEvalue();
  }

  openNotationForGroupe() {
    // On traite d'abord le cas de chaque élève du groupe
    for (const eleve of this.groupe.eleves) {
      const eleveNotation = this.devoirService.devoir.getEleveNotation(eleve);

      // Si l'élève n'a pas de notation alors on lui en créé une et on l'ajoute au devoir
      if (eleveNotation === null) {
        let newNotation = new Notation();
        newNotation.eleve = eleve;
        newNotation.commentaire = '';
        newNotation.notes = [];
        newNotation.notes_coefficients = this.devoirService.devoir.noteCoeffs;
        this.devoirService.devoir.notations.push(newNotation);
      }
    }

    // Maintenance que les élèves sont traités, on gère le groupe (comme une notation à part entière)
    this.openNotation(this.groupe.nom);
  }

  // On passe à une notation suivante qui amènera d'abord à choisir l'élève
  nextNotation() {
    // Clear the current notation
    this.eleve = null;
    this.groupe = null;
    this.notation = null;
    this.critereEvalue = null;
    // Clear commentaire management information
    this.displayCommentaire = false;
    this.editorIsFocused = false;
  }

  deleteNotation() {
    // On demande confirmation avant de vraiement vouloir supprimer
    if (confirm('Voulez-vous vraiment supprimer définitivement la notation de ' + this.notation.eleve + ' ?')) {
      // On supprime la notation
      this.devoirService.devoir.deleteEleveNotation(this.notation.eleve);

      // Si c'est la notation d'un groupe alors il faut traiter le cas des élèves du groupe
      if (this.groupe) {
        if (confirm('Voulez-vous également supprimer les notations des élèves du groupe ?')) {
          for (const eleve of this.groupe.eleves) {
            this.devoirService.devoir.deleteEleveNotation(eleve);
          }
        }
      }

      // En mode single on ferme la fenêtre modale, en mode multi on passe à la notation suivante
      if (this.notationMode === 'single') {
        this.modal.close('ok');
      } else {
        this.nextNotation();
      }
    }
  }

  duplicateGroupeToEleves() {
    // SI un groupe est bien défini
    if (this.groupe) {
      // On prend chaque éleve du groupe
      for (const eleve of this.groupe.eleves) {
        // On supprime la notation actuelle
        this.devoirService.devoir.deleteEleveNotation(eleve);
        // On copie la notation du groupe dans la notation de l'élève (en remettant l'élève après)
        const eleveNotationCopy = JSON.stringify(this.notation.serialize());
        let eleveNotation = new Notation().deserialize(JSON.parse(eleveNotationCopy), this.devoirService.devoir);
        eleveNotation.eleve = eleve;
        this.devoirService.devoir.notations.push(eleveNotation);
      }
    }
  }

}
