import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DevoirService } from '../_services/devoir.service';


@Component({
  selector: 'app-modal-move',
  templateUrl: './modal-move.component.html',
  styleUrls: ['./modal-move.component.sass']
})
export class ModalMoveComponent implements OnInit {

  @Input() public item: any;
  public itemType;
  public selectedItem: any;
  public selectedPosition: any;
  public returnValue;

  constructor(
    public devoirService: DevoirService,
    public modal: NgbActiveModal) {
    this.item = null;
    this.itemType = '';
    this.selectedItem = null;
    this.selectedPosition = null;
    this.returnValue = {};
  }

  ngOnInit() {
    setTimeout(() => {
      this.updateDetails();
    });
  }

  updateDetails() {
    if (this.item) {
      this.itemType = this.item.className;
    } else {
      setTimeout(() => {
        this.updateDetails();
      }, 200);
    }
  }

  selectItem(item: any, position: any) {
    this.selectedItem = item;
    this.selectedPosition = position;
    this.returnValue = {
      item: this.selectedItem,
      position: this.selectedPosition
    };
  }

}

