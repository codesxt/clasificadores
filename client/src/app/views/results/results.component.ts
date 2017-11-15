import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../services/execution';

@Component({
  templateUrl: 'results.component.html',
  providers: [ ]
})
export class ResultsComponent implements OnInit {
  results        : any[] = [];
  selectedResult : any;
  resultFiles    : any[] = [];
  constructor(
    private executionService : ExecutionService
  ) {
  }

  ngOnInit(){
    this.getData();
  }

  getData(){
    this.executionService.getAllResults()
    .subscribe(
      data => {
        this.results = data.data;
      },
      error => {
        console.log(error);
      }
    )
  }

  selectResultset(result: any){
    this.selectedResult = result;
    this.executionService.getResultsByID(this.selectedResult.id)
    .subscribe(
      data => {
        this.resultFiles = data.data;
      }
    )
  }
}
