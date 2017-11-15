import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomentModule } from 'angular2-moment';

import { ResultsComponent } from './results.component';
import { ResultsRoutingModule } from './results-routing.module';

@NgModule({
  imports: [
    ResultsRoutingModule,
    CommonModule,
    MomentModule
  ],
  declarations: [ ResultsComponent ]
})
export class ResultsModule { }
