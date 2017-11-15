import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { ResultsComponent } from './results.component';

const routes: Routes = [
  {
    path: '',
    component: ResultsComponent,
    data: {
      title: 'Resultados'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultsRoutingModule {}
