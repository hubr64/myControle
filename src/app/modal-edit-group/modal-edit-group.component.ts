import { Component, OnInit, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { DevoirService } from '../_services/devoir.service';
import { ConfigurationService } from '../_services/configuration.service';
import { Groupe } from '../_models/groupe';
import { Notation } from '../_models/notation';

@Component({
  selector: 'app-modal-edit-group',
  templateUrl: './modal-edit-group.component.html',
  styleUrls: ['./modal-edit-group.component.sass']
})
export class ModalEditGroupComponent implements OnInit {

  @Input() public groupe: Groupe = null;
  @Input() public selectedGroupe: boolean;
  public groupeNomDefaut = '';

  constructor(
    public devoirService: DevoirService,
    public configurationService: ConfigurationService,
    public modal: NgbActiveModal
  ) {
    this.groupeNomDefaut = this.configurationService.getValue('groupeNomDefaut');
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.selectedGroupe) {
      if (this.groupe === null) {
        this.groupe = new Groupe();
        this.groupe.nom = this.groupeNomDefaut;
        this.groupe.eleves = [];
        this.devoirService.devoir.groupes.push(this.groupe);
      }
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  addEleveInGroupe(eleve) {

    let addInGroupe = true;
    let currentGroupe = this.devoirService.devoir.getEleveGroupe(eleve);
    // Si l'élève est déjà dans un groupe
    if (currentGroupe !== null) {
      // SI c'est le groupe courant alors ça veut dire qu'on souhaite l'enlever
      if (currentGroupe === this.groupe) {
        this.groupe.eleves.splice(this.groupe.eleves.indexOf(eleve), 1);
        addInGroupe = false;
      } else {
        // SI c'est un autre groupe on demande si on veut bien le changer de groupe
        if (confirm(eleve + ' est déjà dans le groupe "' + currentGroupe.nom +
          '". L\'ajouter à ce groupe l\'enlèvera de son groupe actuel. Êtes vus sûr de vouloir l\'ajouter ?')) {
          currentGroupe.eleves.splice(currentGroupe.eleves.indexOf(eleve), 1);
        } else {
          addInGroupe = false;
        }
      }
    }
    // Si on veut bien toujours l'ajouter au groupe  alors on le fait
    if (addInGroupe) {
      // On ajoute l'élève dans le groupe
      this.groupe.eleves.push(eleve);

      // Si le groupe et/ou l'élève sont déjà notés alors il faut un traitement spécifique
      const groupeNotation = this.devoirService.devoir.getEleveNotation(this.groupe.nom);
      if (groupeNotation !== null) {
        // On supprime la notation actuelle
        this.devoirService.devoir.deleteEleveNotation(eleve);
        // On copie la notation du groupe dans la notation de l'élève (en remettant l'élève après)
        const eleveNotationCopy = JSON.stringify(groupeNotation.serialize());
        let eleveNotation = new Notation().deserialize(JSON.parse(eleveNotationCopy), this.devoirService.devoir);
        eleveNotation.eleve = eleve;
        this.devoirService.devoir.notations.push(eleveNotation);
      }
    }
  }

  deleteGroupe() {
    if (confirm('Voulez-vous vraiment supprimer définitivement ce groupe ?')) {

      // On supprime la notation du groupe
      this.devoirService.devoir.deleteEleveNotation(this.groupe.nom);

      // il faut traiter le cas des élèves du groupe
      if (confirm('Voulez-vous également supprimer les notations des élèves du groupe ?')) {
        for (const eleve of this.groupe.eleves) {
          this.devoirService.devoir.deleteEleveNotation(eleve);
        }
      }

      // Enfin on supprime le groupe
      for (const [indexGroupe, groupe] of this.devoirService.devoir.groupes.entries()) {
        if (groupe === this.groupe) {
          this.devoirService.devoir.groupes.splice(indexGroupe, 1);
          this.modal.close('ok');
        }
      }
    }
  }

}
