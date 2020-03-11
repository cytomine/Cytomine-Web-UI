<template>
  <div class="box error" v-if="!configUI['project-images-tab']">
    <h2> {{ $t('access-denied') }} </h2>
    <p>{{ $t('insufficient-permission') }}</p>
  </div>
  <div class="box error" v-else-if="error">
    <h2> {{ $t('error') }} </h2>
    <p>{{ $t('unexpected-error-info-message') }}</p>
  </div>
  <div v-else class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div v-if="!loading" class="panel">
      <div class="panel-heading">
        <p>ROI Groups</p>
        <button class="button is-link">
          Start new analysis
        </button>
      </div>
      <div class="panel-block">
        <div class="search-block">
          <b-input
            class="search-roi-groups"
            v-model="searchString"
            :placeholder="$t('search-placeholder')"
            type="search" icon="search"
          />
        </div>


        <div>
          <p>ROI Groups content</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {get, sync, syncMultiselectFilter, syncBoundsFilter} from '@/utils/store-helpers';

import {ImageInstanceCollection} from 'cytomine-client';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'analyze',
  data() {
    return {
      loading: true,
      error: false,
      revision: 0,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    groupCollection() {
      let collection = new ImageInstanceCollection({
        filterKey: 'project',
        filterValue: this.project.id,
      });
      if(this.searchString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      return collection;
    },
    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
    searchString: sync('searchString', {...storeOptions, debounce: 500}),
    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
  },
  async created() {
    try {
      this.loading = false;
    }
    catch(error) {
      console.error(error);
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

  .search-block {
    display: flex;
  }

  >>> .search-images {
    max-width: 30rem;
    margin-right: 1rem;
  }

  >>> td, >>> th {
    vertical-align: middle !important;
  }
</style>
