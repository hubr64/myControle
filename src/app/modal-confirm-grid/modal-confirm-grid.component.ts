import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from '../_services/message.service';
import { DevoirService } from '../_services/devoir.service';
import { GrilleService } from '../_services/grille.service';
import { Grille } from '../_models/grille';

@Component({
  selector: 'app-modal-confirm-grid',
  templateUrl: './modal-confirm-grid.component.html',
  styleUrls: ['./modal-confirm-grid.component.sass']
})
export class ModalConfirmGridComponent implements OnInit {

  @Input() grilleConfirm: Grille|null = null;
  public removedCapacites : any[];
  public impactedCriteres : any[];

  constructor(
    public messageService: MessageService,
    public devoirService: DevoirService,
    public grilleService: GrilleService,
    public modal: NgbActiveModal) {
    this.removedCapacites = [];
    this.impactedCriteres = [];
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.grilleConfirm && this.devoirService.devoir.grille) {
      this.removedCapacites = this.grilleService.diffCapacitesInGrilles(this.devoirService.devoir.grille, this.grilleConfirm);
      this.impactedCriteres = this.devoirService.getImpactedCriteres(this.removedCapacites);
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 1000);
    }
  }

}
