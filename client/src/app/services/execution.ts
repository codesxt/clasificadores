import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class ExecutionService {
  baseURL: string = environment.apiUrl;
  constructor(
    private http: Http
  ) { }

  executeAlgorithms(executionId: string, body: any): any{
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseURL+'/api/v1/execute', {
      logId       : executionId,
      description : body.description,
      algorithms  : body.algorithms
    }, options).map(
      (response: Response) => response.json()
    );
  }

  killProcess(pid: string){
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.delete(this.baseURL+'/api/v1/process/'+pid, options).map(
      (response: Response) => response.json()
    );
  }

  getDatasets(): any{
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseURL+'/api/v1/datasets', options).map(
      (response: Response) =>response.json()
    )
  }

  deleteDataset(datasetName: string){
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.delete(this.baseURL+'/api/v1/dataset/'+datasetName, options).map(
      (response: Response) =>response.json()
    )
  }

  getResultsByID(resultsID: any): any{
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseURL+'/api/v1/result/'+resultsID, options).map(
      (response: Response) =>response.json()
    )
  }

  deleteResultsByID(resultsID: any): any{
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.delete(this.baseURL+'/api/v1/result/'+resultsID, options).map(
      (response: Response) =>response.json()
    )
  }

  getAllResults(): any{
    let headers = new Headers({

    });
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseURL+'/api/v1/results', options).map(
      (response: Response) =>response.json()
    )
  }
}
