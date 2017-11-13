import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../services/execution';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  templateUrl: 'datasets.component.html',
  providers: [ ]
})
export class DatasetsComponent implements OnInit {
  datasets : string[] = [];
  constructor(
    private executionService : ExecutionService
  ) {
  }

  ngOnInit(){
    this.getData();
  }

  getData(){
    this.executionService.getDatasets()
    .subscribe(
      data => {
        this.datasets = data.data;
      },
      error => {
        console.log(error);
      }
    )
  }

  deleteDataset(datasetName: string){
    let c = confirm("¿Está seguro de que desea borrar el dataset " + datasetName + "?");
    if(c){
      this.executionService.deleteDataset(datasetName)
      .subscribe(
        data => {
          this.getData();
        }
      )
    }
  }
}
