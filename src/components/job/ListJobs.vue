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
<div class="box error" v-if="!configUI['project-jobs-tab']">
  <h2> {{ $t('access-denied') }} </h2>
  <p>{{ $t('insufficient-permission') }}</p>
</div>
<div class="box error" v-else-if="error">
  <h2> {{ $t('error') }} </h2>
  <p>{{ $t('unexpected-error-info-message') }}</p>
</div>
<div v-else class="list-jobs-wrapper content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <div v-if="!loading" class="panel">
    <p class="panel-heading">
      {{$t('analysis')}}
      <button v-if="canAddJob" class="button is-link" @click="launchModal = true">
        {{$t('button-launch-new-analysis')}}
      </button>
    </p>
    <div class="panel-block">
      <div class="filters">
        <h2>{{$t('filters')}}</h2>
        <div class="columns">
          <div class="column filter">
            <div class="filter-label">
              {{$t('algorithm')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedSoftwares" :options="availableSoftwares" multiple track-by="id" label="fullName"/>
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('launcher')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedLaunchers" :options="availableLaunchers" multiple />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('execution-date')}}
            </div>
            <div class="filter-body">
              <cytomine-datepicker
                v-model="selectedDate"
                :styles="['multiselect', 'bold-placeholder']"
                :placeholder="$t('all-dates')"
                :maxDate="new Date()"
              />
            </div>
          </div>

          <div class="column">
            <div class="filter-label">
              {{$t('status')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedStatus" :options="availableStatus"
                label="label" track-by="status" multiple />
            </div>
          </div>
        </div>
      </div>

      <cytomine-table
        :collection="jobCollection"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :openedDetailed.sync="openedDetails"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :revision="revision"
      >
        <template #default="{row: job}">
          <b-table-column field="softwareName" :label="$t('algorithm')" sortable width="1000">
            {{job.softwareName}}
          </b-table-column>

          <b-table-column :label="$t('run-number')" width="500" centered>
            {{job.number}}
          </b-table-column>

          <b-table-column field="username" :label="$t('launched-by')" sortable width="1000">
            {{ job.username }}
          </b-table-column>

          <b-table-column field="created" :label="$t('execution-date')" sortable width="1000">
            {{ Number(job.created) | moment('ll LT') }}
          </b-table-column>

          <b-table-column field="status" :label="$t('status')" sortable centered width="1000">
            <job-status :status="job.status" />
          </b-table-column>
        </template>

        <template #detail="{row: job}">
          <job-details
            :key="job.id"
            :job="job"
            @update="revision++"
            @delete="deleteJob(job)"
            @relaunch="addJob"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-analysis-run')}}</p>
          </div>
        </template>
      </cytomine-table>
    </div>
  </div>

  <add-job-modal :active.sync="launchModal" @add="addJob" />
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter} from '@/utils/store-helpers';

import {JobCollection} from 'cytomine-client';
import JobStatus from './JobStatus';
import JobDetails from './JobDetails';
import AddJobModal from './AddJobModal';
import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineDatepicker from '@/components/form/CytomineDatepicker';
import jobStatusMapping from '@/utils/job-utils';

// store options to use with store helpers to target projects/currentProject/listJobs module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);

export default {
  name: 'list-jobs',
  components: {
    JobStatus,
    JobDetails,
    AddJobModal,
    CytomineTable,
    CytomineMultiselect,
    CytomineDatepicker
  },
  data() {
    return {
      loading: true,
      error: false,
      launchModal: false,
      availableSoftwares: [],
      availableLaunchers: [],
      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    configUI: get('currentProject/configUI'),
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    canAddJob() {
      return !this.currentUser.guestByNow && (this.canManageProject || !this.project.isReadOnly);
    },

    availableStatus() {
      return Object.keys(jobStatusMapping).map(key => {
        return {label: this.$t(jobStatusMapping[key].label), status: key};
      });
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listJobs)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listJobs';
    },

    selectedSoftwares: localSyncMultiselectFilter('softwares', 'availableSoftwares'),
    selectedLaunchers: localSyncMultiselectFilter('launchers', 'availableLaunchers'),
    selectedDate: sync('executionDate', storeOptions),
    selectedStatus: localSyncMultiselectFilter('statuses', 'availableStatus'),

    jobCollection() {
      let collection = new JobCollection({
        project: this.project.id,
        software: (this.selectedSoftwares.length > 0 && this.selectedSoftwares.length < this.availableSoftwares.length) ?
          this.selectedSoftwares.map(option => option.id).join(',') : null
      });

      if(this.selectedLaunchers.length > 0){
        collection['username'] = {
          in: this.selectedLaunchers.join()
        };
      }
      if(this.selectedStatus.length > 0){
        collection['status'] = {
          in: this.selectedStatus.map(option => option.status).join()
        };
      }
      if(this.selectedDate) {
        collection.created = {
          gte: this.selectedDate.getTime(),
          lte: new Date(this.selectedDate).setHours(15, 15, 59, 999)
        };
      }
      return collection;
    },

    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
    openedDetails: sync('openedDetails', storeOptions)
  },
  methods: {
    async fetchMultiselectOptions() {
      let stats = await JobCollection.fetchBounds({project: this.project.id});
      this.availableSoftwares = stats.software.list;
      this.availableLaunchers = stats.username.list;
    },

    async addJob(job) {
      this.openedDetails = [job.id, ...this.openedDetails];
      await this.fetchMultiselectOptions();
      this.revision++;
    },

    async deleteJob(jobToDelete) {
      try {
        await jobToDelete.delete();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-analysis-deletion')
        });
        this.fetchMultiselectOptions();
        this.revision++;
      }
      catch(error) {
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-analysis-deletion')
        });
      }
    }
  },
  async created() {
    try {
      await this.fetchMultiselectOptions();
      this.loading = false;
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
  }
};
</script>

<style scoped>
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  margin-bottom: 1.5em;
}
</style>
