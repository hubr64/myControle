import { Component, OnInit } from '@angular/core';
import { DevoirService } from '../_services/devoir.service';

@Component({
  selector: 'app-devoir-notation',
  templateUrl: './devoir-notation.component.html',
  styleUrls: ['./devoir-notation.component.sass']
})
export class DevoirNotationComponent implements OnInit {

  constructor(private devoirService: DevoirService) { }

  ngOnInit() {
  }

}
