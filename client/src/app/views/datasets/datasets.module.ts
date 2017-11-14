import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgUploaderModule } from 'ngx-uploader';

import { DatasetsComponent } from './datasets.component';
import { DatasetsRoutingModule } from './datasets-routing.module';

@NgModule({
  imports: [
    DatasetsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgUploaderModule
  ],
  declarations: [ DatasetsComponent ]
})
export class DatasetsModule { }
