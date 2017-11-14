import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionService } from '../../services/execution';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';

@Component({
  templateUrl: 'datasets.component.html',
  providers: [ ]
})
export class DatasetsComponent implements OnInit {
  // Variables para la subida de archivos
  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  datasets : string[] = [];
  constructor(
    private executionService : ExecutionService
  ) {
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
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

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      const event: UploadInput = {
        type: 'uploadAll',
        url: 'http://localhost:3000/upload',
        method: 'POST',
        data: { foo: 'bar' }
      };
      this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue'  && typeof output.file !== 'undefined') { // add file to array when added
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
    } else if (output.type === 'done') {
      this.getData();
    }
  }

  startUpload(): void {
    console.log("Starting file upload...");
    const event: UploadInput = {
      type: 'uploadAll',
      url: 'http://localhost:3000/upload',
      method: 'POST',
      data: { foo: 'bar' }
    };

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }
}
