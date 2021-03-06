import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatDialog } from '@angular/material';

import { DataService } from '../../services/data/data.service';
import { GeneratorService } from '../../services/generator/generator.service';

import { ArrayGeneratorDialogComponent } from '../array-generator-dialog/array-generator-dialog.component';
import { FormsConfigDialogComponent } from '../forms-config-dialog/forms-config-dialog.component';


@Component({
  selector: 'app-array-input',
  templateUrl: './array-input.component.html',
  styleUrls: ['./array-input.component.css']
})
export class ArrayInputComponent implements OnInit {
  @Input() value: any;
  @Input() options: any = {};
  @Output() valueChange = new EventEmitter;


  constructor(
    private _dataService: DataService,
    private _generatorService: GeneratorService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    // console.log('Init array input')
  }

  stringify(value) {
    return JSON.stringify(value);
  }

  onChange(valueJSON) {
    // console.log('Change value of array input')
    var value = JSON.parse(valueJSON) || [];
    this.valueChange.emit(value);
  }

  openGeneratorDialog(): void {
    const dialogRef = this.dialog.open(ArrayGeneratorDialogComponent);

    dialogRef.afterClosed().subscribe(d => {
      if (d) {
        d.end = d.end != -1 ? d.end : this._dataService.data.simulation.time;
        d.max = d.max != -1 ? d.max : this._dataService.data.simulation.time;
        let resolution = this._dataService.data.kernel.resolution || 1.0
        d.toFixed = resolution >= 1 ? -1 : String(resolution).split('.')[1].length;
        this.value = this._generatorService.generate(d);
        this.valueChange.emit(this.value)
      }
    });
  }

}
