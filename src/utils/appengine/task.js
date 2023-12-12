import Model from './model';
import { Cytomine } from 'cytomine-client';


export default class Task extends Model {
  /** @inheritdoc */
  static get callbackIdentifier() {
    return 'app-engine/tasks';
  }

  /** @inheritdoc */
  _initProperties() {
    super._initProperties();
  }

  static async fetchAll() {
    let { data } = await Cytomine.instance.api.get(`${this.callbackIdentifier}`);
    return data;
  }

  static async fetchNamespaceVersion(namespace, version) {
    return await Task.fetch(`${namespace}/${version}`);
  };

  static async uploadTask(compressedTask) {
    return await Cytomine.instance.api.post(`${this.callbackIdentifier}`, compressedTask);
  };


}