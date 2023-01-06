import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Grille } from '../_models/grille';
import { Competence } from '../_models/competence';
import { Capacite } from '../_models/capacite';

@Component({
  selector: 'app-modal-grid-selection',
  templateUrl: './modal-grid-selection.component.html',
  styleUrls: ['./modal-grid-selection.component.sass']
})
export class ModalGridSelectionComponent implements OnInit {

  @Input() grilles: any;
  @Input() devoir: any;
  @Input() selectedgrille: any;
  @Input() canChooseCapacite;

  constructor(
    public modal: NgbActiveModal
  ) {
    this.grilles = null;
    this.selectedgrille = null;
    this.canChooseCapacite = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.grilles) {

    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  selectCapacite(capacite: Capacite|null) {
    if (this.canChooseCapacite === true) {
      this.modal.close(capacite);
    }
  }

}
