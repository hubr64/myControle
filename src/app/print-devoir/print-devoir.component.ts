import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Devoir } from '../_models/devoir';
import { PrintService } from '../_services/print.service';
import { DevoirService } from '../_services/devoir.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-print-devoir',
  templateUrl: './print-devoir.component.html',
  styleUrls: ['./print-devoir.component.sass']
})
export class PrintDevoirComponent implements OnInit {

  devoirDetails: Devoir;
  impressionMargeExercice: number;
  impressionMargeQuestion: number;

  constructor(
    route: ActivatedRoute,
    public devoirService: DevoirService,
    public configurationService: ConfigurationService,
    public printService: PrintService) { 
      this.impressionMargeExercice = parseInt(this.configurationService.getValue('impressionMargeExercice'));
      this.impressionMargeQuestion = parseInt(this.configurationService.getValue('impressionMargeQuestion'));
    }

  ngOnInit() {
    this.devoirDetails = this.devoirService.devoir;
    this.printService.onDataReady();
  }

}
