import { Injectable, EventEmitter } from '@angular/core';

import { DBService } from '../services/db/db.service';

declare function require(url: string);


@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public db: any;
  public editing: boolean = false;
  public elementType: string;
  public enabledModel: boolean = false;
  public models: any = {};
  public ready: boolean;
  public selectedModel: string = '';
  public update = new EventEmitter();
  public url: string = 'view';
  public version: string;

  constructor(
    private _dbService: DBService,
  ) {
  }

  init() {
    this.db = this._dbService.init('model');
    this._dbService.checkVersion(this)
    this.count().then(count => {
      if (count == 0) {
        this.fromFiles()
        this.ready = true;
      } else {
        this._dbService.db.list(this.db).then(models => {
          models.map(model => this.models[model.id] = model)
          this.ready = true;
        })
      }
    })
  }



    fromFiles() {
      var files = [
        'ac_generator',
        'dc_generator',
        'iaf_cond_alpha',
        'iaf_psc_alpha',
        'multimeter',
        'noise_generator',
        'poisson_generator',
        'spike_detector',
        'spike_generator',
        'static_synapse',
        'step_current_generator',
        'voltmeter'
      ];

      var models = Object.keys(this.models)
      for (var idx in files) {
        if (!models.includes(files[idx])) {
          var filename = files[idx];
          var model = require('./models/' + filename + '.json');
          this.models[model['id']] = model;
          this._dbService.db.create(this.db, model)
        }
      }
    }

  list(elementType = null, sort = true) {
    var models = Object.keys(this.models);
    if (elementType) {
      models = models.filter(id => {
        var model = this.models[id];
        return model['element_type'] == elementType
      });
    }
    if (sort) {
      models.sort()
    }
    return models
  }

  selectModel(model) {
    this.selectedModel = model;
    this.enabledModel = this.hasModel(model);
  }

  hasModel(model = null) {
    model = model || this.selectedModel;
    return this.list().includes(model);
  }

  config(model = null) {
    return this.models[model || this.selectedModel];
  }

  count() {
    return this._dbService.db.count(this.db)
  }

  save(config) {
    return this._dbService.db.create(this.db, config)
  }

  load() {
    return this._dbService.db.count(this.db).then(count => {
      if (count == 0) {
        this.init()
        setTimeout(() => this.load(), 1000)
      } else {
        this._dbService.db.list(this.db).then(models => this.models = models)
      }
    })
  }

  delete(id) {
    return this._dbService.db.delete(this.db, id)
  }

  reset() {
    this.db.destroy().then(() => {
      this.init()
    })
  }
}
