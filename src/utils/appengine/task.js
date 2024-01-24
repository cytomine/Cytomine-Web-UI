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
    return data.map(props => new Task(props));
  }

  static async fetchNamespaceVersion(namespace, version) {
    return await Task.fetch(`${namespace}/${version}`);
  }

  static async uploadTask(compressedTask) {
    return await Cytomine.instance.api.post(`${this.callbackIdentifier}`, compressedTask);
  }

  static async fetchTaskInputs(namespace, version) {
    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${namespace}/${version}/inputs`);
    return data;
  }

  // Step-1: Create TaskRun Must be part of a project to run a task
  static async createTaskRun(project, namespace, version) {
    return await Cytomine.instance.api.post(`/app-engine/project/${project}/tasks/${namespace}/${version}/runs`);
  }

  // Step-2: Provision task / user inputs
  static async batchProvisionTask(project, runId, params) {
    return await Cytomine.instance.api.put(`/app-engine/project/${project}/task-runs/${runId}/input-provisions`, params);
  }

  static async singleProvisionTask(project, runId, paramName, param) {
    return await Cytomine.instance.api.put(`/app-engine/project/${project}/task-runs/${runId}/input-provisions/${paramName}`, param);
  }

  // Step-3 Run/Execute the Provisioned Task
  static async runTask(project, runId, body) {
    return await Cytomine.instance.api.post(`/app-engine/project/${project}/task-runs/${runId}/state-actions`, body);
  }

  // Status: get the current status of the TaskRun
  static async fetchTaskRunStatus(project, runId) {
    return await Cytomine.instance.api.get(`/app-engine/project/${project}/task-runs/${runId}`);
  }

  // Output: get a TaskRun output
  static async fetchTaskRunOutput(project, runId) {
    return await Cytomine.instance.api.get(`/app-engine/project/${project}/task-runs/${runId}/outputs`);
  }
}