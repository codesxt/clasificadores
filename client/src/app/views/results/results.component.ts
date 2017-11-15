import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../services/execution';
import { environment } from '../../../environments/environment';

@Component({
  templateUrl: 'results.component.html',
  providers: [ ]
})
export class ResultsComponent implements OnInit {
  baseURL: string = environment.apiUrl;
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

  deleteResult(resultID : any){
    this.executionService.deleteResultsByID(resultID)
    .subscribe(
      data => {
        this.getData();
      }
    )
  }
}
