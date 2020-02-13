import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrintComponent } from './print/print.component';
import { PrintDevoirComponent } from './print-devoir/print-devoir.component';
import { PrintCorrectionComponent } from './print-correction/print-correction.component';

const routes: Routes = [
  {
    path: 'print',
    outlet: 'print',
    component: PrintComponent,
    children: [
      { path: 'devoir', component: PrintDevoirComponent },
      { path: 'correction', component: PrintCorrectionComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
