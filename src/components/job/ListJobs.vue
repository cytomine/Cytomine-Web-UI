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
      <button class="button is-link" @click="launchModal = true">
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
              <cytomine-multiselect v-model="selectedSoftwares" :options="availableSoftwares" :multiple="true" />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('launcher')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedLaunchers" :options="availableLaunchers" :multiple="true" />
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
                :placeholder="$t('all')"
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
                label="label" track-by="status" :multiple="true" />
            </div>
          </div>
        </div>
      </div>

      <b-table
        :data="filteredJobs"
        :paginated="true"
        :current-page.sync="currentPage"
        :per-page="perPage"
        pagination-size="is-small"
        detailed
        detail-key="id"
        :opened-detailed.sync="openedDetails"
        :default-sort="sort.field"
        :default-sort-direction="sort.order"
        @sort="updateSort"
      >

        <template #default="{row: job}">
          <b-table-column field="software" :label="$t('algorithm')" sortable width="1000">
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
            @update="props => job.populate(props)"
            @delete="deleteJob(job)"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-analysis-run')}}</p>
          </div>
        </template>

        <template #bottom-left>
          <b-select v-model="perPage" size="is-small">
            <option value="10">10 {{$t('per-page')}}</option>
            <option value="25">25 {{$t('per-page')}}</option>
            <option value="50">50 {{$t('per-page')}}</option>
            <option value="100">100 {{$t('per-page')}}</option>
          </b-select>
        </template>
      </b-table>
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
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineDatepicker from '@/components/form/CytomineDatepicker';
import jobStatusLabelMapping from '@/utils/job-utils';
import moment from 'moment';

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
    CytomineMultiselect,
    CytomineDatepicker
  },
  data() {
    return {
      loading: true,
      error: false,
      jobs: [],
      launchModal: false
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    configUI: get('currentProject/configUI'),

    availableSoftwares() {
      return [...new Set(this.jobs.map(job => job.softwareName))];
    },
    availableLaunchers() {
      return [...new Set(this.jobs.map(job => job.username))].filter(name => name); // TODO: remove filter (HACK to remove empty username)
    },
    availableStatus() {
      return Object.keys(jobStatusLabelMapping).map(key => {
        return {label: this.$t(jobStatusLabelMapping[key]), status: key};
      });
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listJobs)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listJobs';
    },

    selectedSoftwares: localSyncMultiselectFilter('softwares', 'availableSoftwares'),
    selectedLaunchers: localSyncMultiselectFilter('launchers', 'availableLaunchers'),
    selectedDate: sync('executionDate', storeOptions),
    selectedStatus: localSyncMultiselectFilter('statuses', 'availableStatus'),

    filteredJobs() {
      let selectedStatusValues = this.selectedStatus.map(obj => Number(obj.status));
      return this.jobs.filter(job => {
        let correctDate = this.selectedDate ? moment(Number(job.created)).isSame(this.selectedDate, 'day') : true;
        return this.selectedSoftwares.includes(job.softwareName) &&
                    this.selectedLaunchers.includes(job.username) &&
                    correctDate &&
                    selectedStatusValues.includes(job.status);
      });
    },

    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sort: sync('sort', storeOptions),
    openedDetailsStore: get('openedDetails', storeOptions),
    openedDetails: { // HACK cannot use sync because buefy modifies the property => vuex warning because modif outside store
      get() {
        return this.openedDetailsStore.slice();
      },
      set(value) {
        this.$store.commit(this.storeModule + '/setOpenedDetails', value);
      }
    }
  },
  methods: {
    updateSort(field, order) {
      this.sort = {field, order};
    },
    addJob(job) {
      job.username = this.currentUser.username; // HACK because not correctly returned by core
      this.jobs.unshift(job);
      this.openedDetails = [job.id, ...this.openedDetails];
    },
    async deleteJob(jobToDelete) {
      try {
        await jobToDelete.delete();
        this.jobs = this.jobs.filter(job => job.id !== jobToDelete.id);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-analysis-deletion')
        });
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
      this.jobs = (await JobCollection.fetchAll({project: this.project.id})).array;

      // if a job was deleted, the currentPage value might not be valid => reinitialize it
      if((this.currentPage - 1)*this.perPage >= this.filteredJobs.length) {
        this.currentPage = 1;
      }

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
