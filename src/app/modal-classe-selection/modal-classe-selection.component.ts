import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Classe } from '../_models/classe';

@Component({
  selector: 'app-modal-classe-selection',
  templateUrl: './modal-classe-selection.component.html',
  styleUrls: ['./modal-classe-selection.component.sass']
})
export class ModalClasseSelectionComponent implements OnInit {

  @Input() classes;
  @Input() selectedClasse;
  @Input() canChooseEleve;

  constructor(
    public modal: NgbActiveModal
  ) {
    this.classes = null;
    this.selectedClasse = null;
    this.canChooseEleve = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.classes) {

    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  selectEleve(eleve: string) {
    if (this.canChooseEleve === true) {
      this.modal.close(eleve);
    }
  }

}
