import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../services/execution';
import { WebsocketService } from '../../services/websocket';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs/Rx';

export interface Message {
	type: string,
	message: string
}

@Component({
  templateUrl: 'dashboard.component.html',
  providers: [ WebsocketService ]
})
export class DashboardComponent implements OnInit {
  baseURL: string = environment.apiUrl;
  wsockURL : string = environment.wsockURL;
  logger : any = null;
  logs   : string = "";
  logId  : string = "";
  isExecuting : boolean = false;
  pid : string = null;
  resultData : any = null;

  cores : number = 1;

  datasets        : any = [];
  samplingMethods : any = ['LOO'];
  algorithms      : any = [
    "classif.knn",
    "classif.naiveBayes",
    "classif.rpart",
    "classif.randomForest",
    "classif.svm",
    "classif.LiblineaRL1L2SVC",
    "classif.LiblineaRL1LogReg",
    "classif.LiblineaRL2L1SVC",
    "classif.LiblineaRL2LogReg",
    "classif.LiblineaRL2SVC"
  ]

  executionForm: FormGroup;
  constructor(
    private executionService : ExecutionService,
    private websocketService : WebsocketService,
    private formBuilder      : FormBuilder
  ) {
  }

  ngOnInit(){
    this.executionForm = this.formBuilder.group({
      has_header     : [false, Validators.required],
      dataset        : ['', Validators.required],
      class_col      : [1, [Validators.required, Validators.min(1)]],
      normalization  : [true, Validators.required],
      paralelization : [true, Validators.required],
      cores          : [1, [Validators.required, Validators.min(1)]],
      sampling       : ['', Validators.required],
      algorithms     : [null, Validators.required]
    })

    this.logger = this.websocketService.connect(this.wsockURL)
    this.configureWebsocket();

    // Get dataset list
    this.executionService.getDatasets()
    .subscribe(
      data => {
        this.datasets = data.data
        this.executionForm.patchValue({
          dataset : this.datasets[0]
        });
      }
    )

    // Set initial values in form
    this.executionForm.patchValue({
      sampling   : this.samplingMethods[0],
      algorithms : [this.algorithms[0]]
    });
  }

  connectWebsocket(){
    this.logger = this.websocketService.reconnect(this.wsockURL)
  }

  configureWebsocket(){
    this.logger
		.map((response) => {
			let data = JSON.parse(response.data);
			return data;
    })
    .subscribe(
      data => {
        if(data.type=="log")   this.log(data.message);
        if(data.type=="logId") {
          if(this.logId){
            this.logger.next({
              type    : 'SETLOGID',
              message : this.logId
            })
          }else{
            this.logId = data.message;
          }
        };
        if(data.type=="signal"){
          if(data.message=="FINISH"){
            this.isExecuting = false;
          }
        }
        if(data.type=="pid"){
          this.pid = data.message;
        }
        if(data.type=="cores"){
          this.cores = data.message;
          this.executionForm.get('cores').setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.cores)
          ]);
        }
        if(data.type=="resultdata"){
          this.resultData = data.data;
          this.executionService.getResultsByID(this.resultData.id)
          .subscribe(
            data => {
              this.resultData.files = data.data;
            }
          )
        }
      },
      error => {
        console.log("There has been an error. Details: " + JSON.stringify(error));
      },
      () => {
        console.log("Connection with the server has ended.");
        console.log("Attempting to reconnect.");
        this.connectWebsocket();
        this.configureWebsocket();
      }
    );
  }

  messageToServer(message: string){
    console.log("Talking to server.");
    this.logger.next({
      message:message
    });
  }

  doExecution(){
    this.logs = "";
    let description = {
      dataset    : this.executionForm.get('dataset').value,
      has_header : this.executionForm.get('has_header').value,
      class_col  : this.executionForm.get('class_col').value
    }

    let algorithms = {
      normalization  : this.executionForm.get('normalization').value,
      paralelization : this.executionForm.get('paralelization').value,
      cores          : this.executionForm.get('cores').value,
      sampling       : this.executionForm.get('sampling').value,
      algorithms     : this.executionForm.get('algorithms').value
    }

    let body = {
      description : description,
      algorithms  : algorithms
    }
    this.executionService.executeAlgorithms(this.logId, body)
    .subscribe(
      data => {
        console.log(data);
        this.isExecuting = true;
      },
      error => {
        console.log(error);
      }
    )
  }

  killProcess(){
    this.executionService.killProcess(this.pid)
    .subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    )
  }

  log(text){
    this.logs+='\n'+text;
  }
}
