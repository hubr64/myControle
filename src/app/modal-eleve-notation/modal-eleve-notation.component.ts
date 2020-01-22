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

@Component({
  selector: 'app-modal-eleve-notation',
  templateUrl: './modal-eleve-notation.component.html',
  styleUrls: ['./modal-eleve-notation.component.sass']
})
export class ModalEleveNotationComponent implements OnInit {

  @Input() public notation: Notation = null;
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
    console.dir(this.editor);
    if (this.editorIsFocused === false) {
      if (event.key === 'ArrowUp') {
        this.onKeyUp();
      }
      if (event.key === 'ArrowDown') {
        this.onKeyDown();
      }
      if (event.key === '0' || event.key === '1' || event.key === '2' || event.key === '3') {
        this.onChangeStatut(event.key);
      }
      document.getElementById(this.critereEvalue.id).scrollIntoView();

      event.stopPropagation();
      event.preventDefault();
    }
  }

  constructor(
    private devoirService: DevoirService,
    private configurationService: ConfigurationService,
    private modal: NgbActiveModal) {

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
      if (this.notationMode === 'single') {
        // Si une note existe déjà, le premier critère affiché sera celui de la dernière note évaluée
        if (this.notation.notes.length > 0) {
          this.critereEvalue = this.notation.notes[this.notation.notes.length - 1].critere;
          this.critereEvaluePos = this.criteres.indexOf(this.critereEvalue);
          // Si aucune note alors on prend le premier du devoir
        } else {
          this.critereEvalue = this.criteres[0];
          this.critereEvaluePos = 0;
        }
      }
      // Move viewport to selected criteria
      document.getElementById(this.critereEvalue.id).focus();
      document.getElementById(this.critereEvalue.id).scrollIntoView();
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  createNote(noteStatus: string, critere: Critere): Note {
    const newNote = new Note();
    newNote.status = noteStatus;
    newNote.critere = critere;
    newNote.noteCoeffs = this.devoirService.devoir.noteCoeffs;
    return newNote;
  }

  toggleCritere(critere: Critere) {
    this.critereEvalue = critere;
    this.critereEvaluePos = this.criteres.indexOf(critere);
    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        let critereFound = false;
        for (const note of notation.notes) {
          if (note.critere === this.critereEvalue) {
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
        if (critereFound === false) {
          notation.notes.push(this.createNote(this.noteStatusKo, this.critereEvalue));
        }
      }
    }
  }

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

    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        let critereFound = false;
        for (const note of notation.notes) {
          if (note.critere === this.critereEvalue) {
            critereFound = true;
            note.status = newStatus;
          }
        }
        if (critereFound === false && newStatus !== null) {
          notation.notes.push(this.createNote(newStatus, this.critereEvalue));
        }
      }
    }
    if (this.critereEvaluePos !== this.criteres.length - 1) {
      this.onKeyDown();
    } else {
      this.displayCommentaire = true;
    }
  }

  onKeyUp() {
    if (this.critereEvalue && this.critereEvaluePos) {
      this.critereEvaluePos--;
      if (this.critereEvaluePos === 0) {
        this.critereEvaluePos = this.criteres.length - 1;
      }
      this.critereEvalue = this.criteres[this.critereEvaluePos];
    }
  }

  onKeyDown() {
    if (this.critereEvalue) {
      this.critereEvaluePos++;
      if (this.critereEvaluePos === this.criteres.length) {
        this.critereEvaluePos = 0;
      }
      this.critereEvalue = this.criteres[this.critereEvaluePos];
    }
  }

  acceptAllCriteres() {
    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
        for (const critere of this.criteres) {
          notation.notes.push(this.createNote(this.noteStatusOk, critere));
        }
      }
    }

  }

  denyAllCriteres() {
    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
        for (const critere of this.criteres) {
          notation.notes.push(this.createNote(this.noteStatusKo, critere));
        }
      }
    }
  }

  deleteAllCriteres() {
    for (const notation of this.devoirService.devoir.notations) {
      if (notation === this.notation) {
        notation.notes = [];
      }
    }
  }

  toggleCommentaire() {
    this.displayCommentaire = !this.displayCommentaire;
  }
  public onReadyEditor(editor) {
    editor.editing.view.focus();
  }
  public onBlurEditor({ editor }: BlurEvent) {
    this.editorIsFocused = false;
  }
  public onFocusEditor({ editor }: FocusEvent) {
    this.editorIsFocused = true;
  }

  changeZoom(offset: number) {
    this.fontSizeDisplay = this.fontSizeDisplay + offset;
  }

  nbPointsObtenus(item): number {
    let nbPoints = 0;

    return nbPoints;
  }

}
