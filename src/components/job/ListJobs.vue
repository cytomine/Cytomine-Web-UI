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
              <cytomine-datepicker v-model="selectedDate" :placeholder="$t('all')" :maxDate="new Date()" />
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
        ref="table"
        default-sort="created"
        default-sort-direction="desc"
        :paginated="true"
        :per-page="perPage"
        pagination-size="is-small"
        detailed
        detail-key="id"
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
import {JobCollection} from 'cytomine-client';
import JobStatus from './JobStatus';
import JobDetails from './JobDetails';
import AddJobModal from './AddJobModal';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineDatepicker from '@/components/form/CytomineDatepicker';
import jobStatusLabelMapping from '@/utils/job-utils';
import moment from 'moment';

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
      searchString: '',
      perPage: 10,
      launchModal: false,

      selectedSoftwares: [],
      selectedLaunchers: [],
      selectedDate: null,
      selectedStatus: [],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.user;
    },
    project() {
      return this.$store.state.project.project;
    },
    configUI() {
      return this.$store.state.project.configUI;
    },

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
  },
  methods: {
    addJob(job) {
      job.username = this.currentUser.username; // HACK because not correctly returned by core
      if(!this.availableSoftwares.includes(job.softwareName)) {
        this.selectedSoftwares.push(job.softwareName);
      }

      if(!this.availableLaunchers.includes(job.username)) {
        this.selectedLaunchers.push(job.username);
      }

      this.jobs.unshift(job);
      this.$refs.table.toggleDetails(job);
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
      this.selectedSoftwares = this.availableSoftwares.slice();
      this.selectedLaunchers = this.availableLaunchers.slice();
      this.selectedStatus = this.availableStatus.slice();
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

<style lang="scss">
.list-jobs-wrapper .datepicker .input {
  min-height: 40px;
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  font-size: 1rem;
  font-family: inherit;

  &::placeholder {
    color: black !important;
    opacity: 1;
    font-weight: 600;
  }
}
</style>

