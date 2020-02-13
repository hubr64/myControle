import { Component } from '@angular/core';

import { PrintService } from './_services/print.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  title = 'myControle';

  constructor(
    public printService: PrintService) {
  }
}
