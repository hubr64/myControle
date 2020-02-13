import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class PrintService {

  isPrinting = false;

  constructor(public router: Router) { }

  printDocument(documentName: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      {
        outlets: {
          print: ['print', documentName]
        }
      }]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null } }]);
    });
  }
}
