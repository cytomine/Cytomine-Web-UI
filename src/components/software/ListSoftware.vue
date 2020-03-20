<template>
<div class="list-software-wrapper content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />

  <div class="box error" v-if="error">
    <h2> {{ $t('error') }} </h2>
    <p>{{ $t('unexpected-error-info-message') }}</p>
  </div>
  <div v-else-if="!loading" class="panel">
    <p class="panel-heading">
      {{$t('algorithms')}}
<!--      <button v-if="!currentUser.guestByNow" class="button is-link" @click="creationModal = true">-->
<!--        {{$t('new-algorithm')}}-->
<!--      </button>-->
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
          class="search-softwares"
          v-model="searchString"
          :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
        <button class="button" @click="toggleFilterDisplay()">
          <span class="icon">
            <i class="fas fa-filter"></i>
          </span>
          <span>
            {{filtersOpened ? $t('button-hide-filters') : $t('button-show-filters')}}
          </span>
          <span v-if="nbActiveFilters" class="nb-active-filters">
            {{nbActiveFilters}}
          </span>
        </button>
      </div>

      <b-collapse :open="filtersOpened">
        <div class="filters">
          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('nb-jobs')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsJobs" :max="maxNbJobs" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('nb-success-jobs')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsSuccessJobs" :max="maxNbSuccessJobs" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('only-last-release')}}
              </div>
              <div class="filter-body">
                <b-switch v-model="onlyLastReleases" class="switch">
                  <template v-if="onlyLastReleases">{{$t('yes')}}</template>
                  <template v-else>{{$t('no')}}</template>
                </b-switch>
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('only-UI-runnable')}}
              </div>
              <div class="filter-body">
                <b-switch v-model="onlyExecutables" class="switch">
                  <template v-if="onlyExecutables">{{$t('yes')}}</template>
                  <template v-else>{{$t('no')}}</template>
                </b-switch>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>


      <b-table
        :data="filteredSoftwares"
        class="table-softwares"
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
        <template #default="{row: software}">
          <b-table-column field="name" :label="$t('name')" sortable width="250">
            <router-link :to="`/software/${software.id}`">
              {{ software.fullName }}
            </router-link>
          </b-table-column>

          <b-table-column field="softwareStatus" :label="$t('version')" centered sortable width="150" :custom-sort="sortBySoftwareStatus">
            <software-status :software="software" />
          </b-table-column>

          <b-table-column field="executable" :label="$t('ui-runnable')" centered sortable width="150">
            <boolean-item :value="software.executable" />
          </b-table-column>

          <b-table-column field="numberOfJob" :label="$t('number-jobs')" centered sortable width="150">
            {{ software.numberOfJob }}
          </b-table-column>

          <b-table-column field="numberOfSuccess" :label="$t('number-success')" centered sortable width="150">
            {{ software.numberOfSuccess }}
          </b-table-column>

          <b-table-column field="created" :label="$t('creation-date')" centered sortable width="180">
            {{ Number(software.created) | moment('ll') }}
          </b-table-column>

          <b-table-column label=" " centered width="150">
            <router-link :to="`/software/${software.id}`" class="button is-small is-link">
              {{$t('button-open')}}
            </router-link>
          </b-table-column>
        </template>

        <template #detail="{row: software}">
          <software-details
            :software="software"
            :excluded-properties="excludedProperties"
            @update="updateSoftware"
            @delete="deleteSoftware(software)"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-software')}}</p>
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

<!--  <add-software-modal :active.sync="creationModal" />-->
</div>
</template>

<script>
import CytomineSlider from '@/components/form/CytomineSlider';
import SoftwareStatus from '@/components/software/SoftwareStatus';
import BooleanItem from '@/components/utils/BooleanItem';
import SoftwareDetails from '@/components/software/SoftwareDetails';

import {get, sync, syncFilter, syncBoundsFilter} from '@/utils/store-helpers';
import {getWildcardRegexp} from '@/utils/string-utils';

import {SoftwareCollection} from 'cytomine-client';


export default {
  name: 'list-software',
  components: {
    BooleanItem,
    SoftwareStatus,
    CytomineSlider,
    SoftwareDetails
  },
  data() {
    return {
      loading: true,
      error: false,
      creationModal: false,

      softwares: [],

      excludedProperties: [
        'name',
        'created',
        'executable',
        'status',
        'pullingCommand',
        'executeCommand'
      ]
    };
  },
  computed: {
    currentUser: get('currentUser/user'),

    searchString: sync('listSoftware/searchString'),
    filtersOpened: sync('listSoftware/filtersOpened'),

    maxNbJobs() {
      return Math.max(10, ...this.softwares.map(software => software.numberOfJob));
    },

    maxNbSuccessJobs() {
      return Math.max(10, ...this.softwares.map(software => software.numberOfSuccess));
    },

    boundsJobs: syncBoundsFilter('listSoftware', 'boundsJobs', 'maxNbJobs'),
    boundsSuccessJobs: syncBoundsFilter('listSoftware', 'boundsSuccessJobs', 'maxNbSuccessJobs'),
    onlyLastReleases: syncFilter('listSoftware', 'onlyLastReleases'),
    onlyExecutables: syncFilter('listSoftware', 'onlyExecutables'),

    nbActiveFilters() {
      return this.$store.getters['listSoftware/nbActiveFilters'];
    },

    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    filteredSoftwares() {
      let filtered = this.softwares;

      if(this.searchString) {
        filtered = filtered.filter(software => this.regexp.test(software.name));
      }

      filtered = filtered.filter(software => {
        return (software.numberOfJob >= this.boundsJobs[0] && software.numberOfJob <= this.boundsJobs[1]) &&
          (software.numberOfSuccess >= this.boundsSuccessJobs[0] && software.numberOfSuccess <= this.boundsSuccessJobs[1]) &&
          ((this.onlyLastReleases && software.softwareVersion && !software.deprecated) || !this.onlyLastReleases) &&
          ((this.onlyExecutables && software.executable) || !this.onlyExecutables);
      });

      return filtered;
    },

    currentPage: sync('listSoftware/currentPage'),
    perPage: sync('listSoftware/perPage'),
    sort: sync('listSoftware/sort'),
    openedDetails: { // HACK cannot use sync because buefy modifies the property => vuex warning because modif outside store
      get() {
        return this.$store.state.listSoftware.openedDetails.slice();
      },
      set(value) {
        this.$store.commit('listSoftware/setOpenedDetails', value);
      }
    }
  },
  methods: {
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },
    updateSort(field, order) {
      this.sort = {field, order};
    },
    sortBySoftwareStatus(a, b, asc) {
      return ((asc) ? 1 : -1) * (this.getSoftwareStatusValue(a) - this.getSoftwareStatusValue(b));
    },
    getSoftwareStatusValue(software) {
      if (!software.softwareVersion) return 0;
      if (software.deprecated) return 1;
      return 2;
    },
    updateSoftware(updatedSoftware) {
      let software = this.softwares.find(software => software.id === updatedSoftware.id);
      if(software) {
        software.populate({...updatedSoftware});
      }
    },
    async deleteSoftware(softwareToDelete) {
      try {
        await softwareToDelete.delete();
        this.softwares = this.softwares.filter(software => software.id !== softwareToDelete.id);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-algorithm-deletion', {softwareName: softwareToDelete.name})
        });
      }
      catch(error) {
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-algorithm-deletion', {softwareName: softwareToDelete.name})
        });
      }
    }
  },
  async created() {
    try {
      let softwares = await SoftwareCollection.fetchAll();

      this.softwares = softwares.array;

      // if a software was deleted, the currentPage value might not be valid => reinitialize it
      if((this.currentPage - 1)*this.perPage >= this.filteredSoftwares.length) {
        this.currentPage = 1;
      }
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }

    this.loading = false;
  }
};
</script>

<style scoped>
.panel-block {
  padding-top: 0.8em;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-block {
  display: flex;
}

.switch {
  margin-left: 1em;
}
</style>

<style>
.search-softwares {
  max-width: 25em;
  margin-right: 1em;
}

.table-softwares {
  margin-top: 1rem;
}

.list-software-wrapper td, .list-software-wrapper th {
  vertical-align: middle !important;
}
</style>
