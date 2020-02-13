import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Devoir } from '../_models/devoir';
import { PrintService } from '../_services/print.service';
import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-print-correction',
  templateUrl: './print-correction.component.html',
  styleUrls: ['./print-correction.component.sass']
})
export class PrintCorrectionComponent implements OnInit {

  devoirDetails: Devoir;

  constructor(
    route: ActivatedRoute,
    public devoirService: DevoirService,
    public printService: PrintService) { }

  ngOnInit() {
    this.devoirDetails = this.devoirService.devoir;
    this.printService.onDataReady();
  }

}
