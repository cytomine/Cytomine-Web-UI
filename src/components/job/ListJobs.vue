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
          <div class="column filter is-one-third">
            <div class="filter-label">
              {{$t('algorithm')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedSoftwares" :options="availableSoftwares" multiple />
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

          <div class="column">
            <div class="filter-label">
              {{$t('favorite')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedFavorites" :options="availableFavorites"
                label="label" track-by="value" multiple />
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
          <b-table-column field="favorite" :label="$t('fav')" sortable centered width="50">
            <a @click="toggleFavorite(job)" v-if="canEdit(job)">
              <i class="fas fa-star" :class="{disabled: !job.favorite}"></i>
            </a>
            <i v-else class="fas fa-star" :class="{disabled: !job.favorite}"></i>
          </b-table-column>
          <b-table-column field="software" :label="$t('algorithm')" sortable width="1000">
            <router-link :to="`/software/${job.software}`">
              {{job.softwareName}}
            </router-link>
          </b-table-column>

          <b-table-column :label="$t('run-number')" width="500" centered>
            {{job.number}}
          </b-table-column>

          <b-table-column field="username" :label="$t('launched-by')" sortable width="600">
            {{ job.username }}
          </b-table-column>

          <b-table-column field="created" :label="$t('execution-date')" sortable width="600">
            {{ Number(job.created) | moment('ll LT') }}
          </b-table-column>

          <b-table-column field="status" :label="$t('status')" sortable centered width="600">
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
            <option value="10">{{$t('count-per-page', {count: 10})}}</option>
            <option value="25">{{$t('count-per-page', {count: 25})}}</option>
            <option value="50">{{$t('count-per-page', {count: 50})}}</option>
            <option value="100">{{$t('count-per-page', {count: 100})}}</option>
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
import jobStatusMapping from '@/utils/job-utils';
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
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    canAddJob() {
      return !this.currentUser.guestByNow && (this.canManageProject || !this.project.isReadOnly);
    },

    availableSoftwares() {
      return [...new Set(this.jobs.map(job => job.softwareName))];
    },
    availableLaunchers() {
      return [...new Set(this.jobs.map(job => job.username))].filter(name => name); // TODO: remove filter (HACK to remove empty username)
    },
    availableStatus() {
      return Object.keys(jobStatusMapping).map(key => {
        return {label: this.$t(jobStatusMapping[key].label), status: key};
      });
    },
    availableFavorites() {
      return [
        {label: this.$t('yes'), value: true},
        {label: this.$t('no'), value: false}
      ];
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listJobs)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listJobs';
    },

    selectedSoftwares: localSyncMultiselectFilter('softwares', 'availableSoftwares'),
    selectedLaunchers: localSyncMultiselectFilter('launchers', 'availableLaunchers'),
    selectedDate: sync('executionDate', storeOptions),
    selectedStatus: localSyncMultiselectFilter('statuses', 'availableStatus'),
    selectedFavorites: localSyncMultiselectFilter('favorites', 'availableFavorites'),

    filteredJobs() {
      let selectedStatusValues = this.selectedStatus.map(obj => Number(obj.status));
      let selectedFavoritesValues = this.selectedFavorites.map(obj => Boolean(obj.value));
      return this.jobs.filter(job => {
        let correctDate = this.selectedDate ? moment(Number(job.created)).isSame(this.selectedDate, 'day') : true;
        return this.selectedSoftwares.includes(job.softwareName) &&
                    this.selectedLaunchers.includes(job.username) &&
                    correctDate &&
                    selectedStatusValues.includes(job.status) &&
                    selectedFavoritesValues.includes(job.favorite);
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
    canEdit(job) {
      return this.$store.getters['currentProject/canDeleteJob'](job);
    },
    updateSort(field, order) {
      this.sort = {field, order};
    },
    addJob(job) {
      this.jobs.unshift(job);
      this.openedDetails = [job.id, ...this.openedDetails];
    },
    async toggleFavorite(job) {
      job.favorite = !job.favorite;
      await job.setFavorite();
      await this.refreshJobs();
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
    },
    async refreshJobs() {
      try {
        this.jobs = (await JobCollection.fetchAll({project: this.project.id})).array;

        // if a job was deleted, the currentPage value might not be valid => reinitialize it
        if((this.currentPage - 1)*this.perPage >= this.filteredJobs.length) {
          this.currentPage = 1;
        }
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    }
  },
  async created() {
    await this.refreshJobs();
    this.loading = false;
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

a:hover .fas {
  color: rgb(35, 102, 216);
}

a:hover .fas.disabled, a:hover .disabled .fas {
  color: rgba(35, 102, 216, 0.5);
}

.fas {
  color: black;
  width: 20px;
  position: relative;
}

.fas.fa-flag {
  font-size: 0.8em;
  bottom: 0.5em;
}

.fas.disabled, .disabled .fas {
  color: rgba(0, 0, 0, 0.1);
}
</style>
