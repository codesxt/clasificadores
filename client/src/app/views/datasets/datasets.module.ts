import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatasetsComponent } from './datasets.component';
import { DatasetsRoutingModule } from './datasets-routing.module';

@NgModule({
  imports: [
    DatasetsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ DatasetsComponent ]
})
export class DatasetsModule { }
