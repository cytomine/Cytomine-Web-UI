<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


<template>
<div class="job-details-wrapper">
  <b-loading :is-full-page="false" :active.sync="loading" class="small" />

  <template v-if="!loading">
    <table class="table">
      <tbody>
          <tr v-if="isRunning">
            <td>{{$t('progress')}}</td>
            <td>
              <progress class="progress is-info" :value="job.progress" max="100">
                {{job.progress}}%
              </progress>
            </td>
          </tr>
          <tr>
            <td>{{$t('status-comment')}}</td>
            <td>{{job.statusComment || "-"}}</td>
          </tr>
          <tr v-if="isSuccessful">
            <td>{{$t('execution-duration')}}</td>
            <td>{{Number(job.updated) - Number(job.created) | duration('humanize')}}</td>
          </tr>
          <tr>
            <td>{{$t('parameters')}}</td>
            <td>
              <button class="button is-small" @click="showParameters = !showParameters">
                <span>{{showParameters ? $t('button-hide') : $t('button-show')}}</span>
              </button>
              <b-collapse :open="showParameters">
                <table class="table is-narrow inline-table is-fullwidth">
                  <thead>
                    <tr>
                      <th>{{$t('name')}}</th>
                      <th>{{$t('value')}}</th>
                      <th>{{$t('type')}}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="param in job.jobParameters.array" :key="param.id">
                      <td>{{param.humanName}}</td>
                      <td>{{param.value}}</td>
                      <td>{{$t(param.type.toLowerCase())}}</td>
                    </tr>
                  </tbody>
                </table>
              </b-collapse>
            </td>
          </tr>
          <tr v-if="isFinished">
            <td>{{$t('execution-log')}}</td>
            <td v-if="isJustFinished && !log">
              <div class="loading">
                <i class="fas fa-spinner fa-spin fa-fw"></i>&nbsp;
                <em class="has-text-grey">{{$t('log-being-collected')}}</em>
              </div>
            </td>
            <td v-else-if="log">
              <button class="button is-small" @click="showLog = !showLog">
                <span>{{showLog ? $t('button-hide') : $t('button-show')}}</span>
              </button>
              <b-collapse :open="showLog">
                <pre>{{log.data}}</pre>
              </b-collapse>
            </td>
            <td v-else>
              <em class="has-text-grey">{{$t('not-found')}}</em>
            </td>
          </tr>
          <tr>
            <td class="prop-label">{{$t('tags')}}</td>
            <td class="prop-content">
              <cytomine-tags :object="job" :canEdit="canManageJob" />
            </td>
          </tr>
          <tr v-if="hasAnnotationResult">
            <td>{{$t('data')}}</td>
            <td v-if="hasAnnotationResult">
              <router-link :to="`/project/${project.id}/annotations?userJob=${job.userJob}`">
                {{$tc("count-annotations", allData.annotations, {count: allData.annotations})}}
              </router-link>
            </td>
          </tr>
          <tr v-if="hasFileResult">
            <td>{{$t('files')}}</td>
            <td>
              <table v-if="jobData.length > 0" class="table inline-table is-fullwidth is-narrow">
                <thead>
                  <tr>
                    <th>{{$t('filename')}}</th>
                    <th>{{$t('comment')}}</th>
                    <th>{{$t('size')}}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="data in jobData" :key="data.id">
                    <td>{{data.filename}}</td>
                    <td>{{data.key}}</td>
                    <td>{{filesize(data.size)}}</td>
                    <td>
                      <div class="buttons">
                        <a class="button is-small" :href="data.viewURL" target='_blank'>{{$t('button-view')}}</a>
                        <a class="button is-small" :href="data.downloadURL">{{$t('button-download')}}</a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <em v-else class="has-text-grey">{{$t('no-result-file')}}</em>
            </td>
          </tr>
          <tr v-if="job.dataDeleted">
            <td>{{$t('data')}}</td>
            <td>
              {{$t('deleted-analysis-data')}}
            </td>
          </tr>
          <tr v-if="canManageJob">
            <td>{{$t('actions')}}</td>
            <td>
              <div class="buttons are-small">
                <button class="button" @click="relaunchJob()">
                  {{$t('relaunch')}}
                </button>
                <button v-if="!job.dataDeleted && isFinished" class="button" @click="deletionModal = true">
                  {{$t('delete-data')}}
                </button>
                <button v-if="isFinished" class="button is-danger" @click="confirmJobDeletion()">
                  {{$t('button-delete')}}
                </button>
                <button v-else class="button is-danger" @click="confirmJobKilling()">
                  {{$t('button-kill')}}
                </button>
              </div>
            </td>
          </tr>
      </tbody>
    </table>

    <cytomine-modal :active="deletionModal" :title="$t('delete-analysis-data')" @close="deletionModal = false">
      <p>{{$t('confirm-deletion-analysis-data')}}</p>
      <ul>
        <li>{{$tc("count-annotations", allData.annotations, {count: allData.annotations})}}</li>
        <li>{{$tc("count-reviewed-annotations", allData.reviewed, {count: allData.reviewed})}}</li>
        <li>{{$tc("count-annotation-terms", allData.annotationsTerm, {count: allData.annotationsTerm})}}</li>
        <li>{{$tc("count-files", allData.jobDatas, {count: allData.jobDatas})}}</li>
      </ul>

      <p class="has-margin-top">{{$t('remark-long-operation')}}</p>

      <template v-if="deletionTask">
        <hr>
        <cytomine-task :task.sync="deletionTask" />
      </template>

      <template #footer>
        <button class="button" type="button" @click="deletionModal = false">
          {{$t('button-cancel')}}
        </button>
        <button class="button is-danger" @click="deleteData()">
          {{$t('button-confirm')}}
        </button>
      </template>
    </cytomine-modal>
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {Job, JobStatus, JobDataCollection, Task} from 'cytomine-client';
import filesize from 'filesize';
import CytomineModal from '@/components/utils/CytomineModal';
import CytomineTask from '@/components/utils/CytomineTask';
import CytomineTags from '@/components/tag/CytomineTags';

import constants from '@/utils/constants.js';
const REFRESH_INTERVAL = constants.JOB_DETAILS_REFRESH_INTERVAL;
const REFRESH_LOG_INTERVAL = constants.JOB_LOGS_REFRESH_INTERVAL;

export default {
  name: 'job-details',
  props: {
    job: Object
  },
  components: {
    CytomineModal,
    CytomineTask,
    CytomineTags
  },
  data() {
    return {
      loading: true,
      justFinishedInterval: 60000, // in milliseconds

      showParameters: false,
      showLog: false,

      allData: null,
      jobData: [],
      log: null,
      timeoutRefresh: null,

      deletionModal: false,
      deletionTask: null
    };
  },
  computed: {
    project: get('currentProject/project'),
    canManageJob() {
      return this.$store.getters['currentProject/canManageJob'](this.job);
    },
    isRunning() {
      return this.job.status === JobStatus.RUNNING;
    },
    isSuccessful() {
      return this.job.status === JobStatus.SUCCESS;
    },
    isFinished() {
      return this.isSuccessful || this.job.status === JobStatus.FAILED || this.job.status === JobStatus.KILLED;
    },
    isJustFinished() {
      return this.isFinished && (Date.now() - Number(this.job.created) < this.justFinishedInterval);
    },
    hasAnnotationResult() {
      return this.allData.annotations > 0;
    },
    hasFileResult() {
      return this.allData.jobDatas > 0;
    }
  },
  methods: {
    async refresh(force=false) {
      if(this.isFinished && !force) {
        return;
      }

      let job = await Job.fetch(this.job.id);
      this.$emit('update', job);
      await this.fetchData();
      this.job.status = job.status;
      this.fetchLog();

      clearTimeout(this.timeoutRefresh);
      this.timeoutRefresh = setTimeout(this.refresh, REFRESH_INTERVAL);
    },
    filesize(size) {
      return filesize(size, {base: 10});
    },
    async fetchLog() {
      if (this.isFinished) {
        let maxRetries = (this.isJustFinished) ? Math.round(this.justFinishedInterval / REFRESH_LOG_INTERVAL) : 1;
        while (!this.log && maxRetries > 0) {
          try {
            this.log = await this.job.fetchLog();
          }
          catch (e) {
            // Do nothing as a 404 error has meaning: no log found
            await new Promise(resolve => setTimeout(resolve, REFRESH_LOG_INTERVAL));
            maxRetries--;
          }
        }

      }
    },
    async fetchData() {
      this.allData = await this.job.fetchAllData();
      if(this.hasFileResult) {
        this.jobData = (await JobDataCollection.fetchAll({filterKey: 'job', filterValue: this.job.id})).array;
      }
    },
    async deleteData() {
      let job = this.job.clone(); // create new job to avoid mutating the prop
      try {
        this.deletionTask = await new Task({project: this.project.id}).save();
        await job.deleteAllData(this.deletionTask.id);
        this.refresh(true);
        this.deletionTask = null;
        this.deletionModal = false;
        this.$notify({type: 'success', text: this.$t('notif-success-analysis-data-deletion')});
      }
      catch(error) {
        console.log(error);
        this.deletionTask = null;
        this.$notify({type: 'error', text: this.$t('notif-error-analysis-data-deletion')});
      }
    },
    async killJob() {
      let job = this.job.clone();
      try {
        await job.kill();
        this.$emit('update', job);
        this.$notify({type: 'success', text: this.$t('notif-success-analysis-kill')});
      }
      catch (error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-analysis-data-kill')});
      }
    },
    confirmJobDeletion() {
      this.$buefy.dialog.confirm({
        title: this.$t('delete-analysis'),
        message: this.$t('delete-analysis-confirmation-message'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.$emit('delete')
      });
    },
    confirmJobKilling() {
      this.$buefy.dialog.confirm({
        title: this.$t('kill-analysis'),
        message: this.$t('kill-analysis-confirmation-message'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.killJob()
      });
    },
    async relaunchJob() {
      try {
        let newJob = await this.job.copy();
        this.$emit('relaunch', newJob);
        await newJob.execute();
        this.$notify({type: 'success', text: this.$t('notif-success-analysis-launch')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-analysis-launch')});
      }
    },
  },
  async created() {
    await this.fetchData();
    this.fetchLog();
    this.loading = false;
    this.timeoutRefresh = setTimeout(this.refresh, REFRESH_INTERVAL);
  },
  beforeDestroy() {
    clearTimeout(this.timeoutRefresh);
  }
};
</script>

<style scoped>
.job-details-wrapper {
  position: relative;
  min-height: 50px;
}

.table {
  background: none;
  position: relative;
  margin-bottom: 0 !important;
}

td:first-child {
  white-space: nowrap;
  font-weight: 600;
}

td:not(:first-child) {
  width: 100%;
}

.inline-table td:first-child {
  font-weight: normal;
}

.inline-table td:not(:first-child) {
  width: auto;
}

ul {
  margin-left: 2em;
  list-style-type: disc;
}

.has-margin-top {
  margin-top: 1.5em;
}

.loading {
  display: block;
}
</style>

<style scoped lang="scss">
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
