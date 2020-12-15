<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

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
<div class="box error" v-if="!configUI['project-image-groups-tab']">
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
    <p class="panel-heading">
      {{$t('image-groups')}}
<!--      <button v-if="canAddImage" class="button is-link" @click="addImageModal = true">-->
<!--        {{$t('button-add-image')}}-->
<!--      </button>-->
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
            class="search-images"
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
            <div class="column filter is-one-quarter">
              <div class="filter-label">
                {{$t('tags')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                                      label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
              </div>
            </div>
          </div>

        </div>
      </b-collapse>

      <cytomine-table
          :collection="groupCollection"
          :is-empty="nbEmptyFilters > 0"
          :currentPage.sync="currentPage"
          :perPage.sync="perPage"
          :openedDetailed.sync="openedDetails"
          :sort.sync="sortField"
          :order.sync="sortOrder"
          :revision="revision"
      >
        <template #default="{row: imageGroup}">
          <b-table-column :label="$t('overview')" width="100">
            <router-link
                v-if="imageGroup.imageInstances.length > 0"
                :to="viewerURL(imageGroup)"
            >
<!--              <img :src="imageGroup.thumb" class="image-overview">-->
            </router-link>
          </b-table-column>

          <b-table-column
              :field="blindMode ? 'blindedName' : 'instanceFilename'"
              :label="$t('name')"
              sortable
              width="400"
          >
            <router-link :to="viewerURL(imageGroup)">
              {{imageGroup.name}}
            </router-link>
          </b-table-column>

          <b-table-column
            :field="'imageInstances.length'"
            :label="$t('images')" centered sortable width="150"
          >
            {{ imageGroup.imageInstances.length }}
          </b-table-column>

          <b-table-column label=" " centered width="150">
            <router-link
                :to="viewerURL(imageGroup)"
                class="button is-small is-link"
                :disabled="imageGroup.imageInstances.length === 0"
            >
              {{$t('button-open')}}
            </router-link>
          </b-table-column>
        </template>

        <template #detail="{row: imageGroup}">
          <image-group-details
              :image-group="imageGroup"
              :excludedProperties="excludedProperties"
              editable
              @delete="refreshData"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-image-group')}}</p>
          </div>
        </template>
      </cytomine-table>
    </div>

<!--    <add-image-modal :active.sync="addImageModal" @addImage="refreshData" />-->
  </div>
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';

import AddImageModal from '../image/AddImageModal';
import ImageGroupDetails from '@/components/image-group/ImageGroupDetails';

import {ImageGroupCollection, TagCollection} from 'cytomine-client';


// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);


export default {
  name: 'list-image-groups',
  components: {
    ImageGroupDetails,
    CytomineTable,
    CytomineMultiselect,
    CytomineSlider,
    AddImageModal
  },
  data() {
    return {
      loading: true,
      error: false,
      addImageModal: false,
      excludedProperties: [],
      availableTags:[],
      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    blindMode() {
      return this.project.blindMode;
    },
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    canAddImage() {
      return !this.currentUser.guestByNow && (this.canManageProject || !this.project.isReadOnly);
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImageGroups';
    },

    searchString: sync('searchString', {...storeOptions, debounce: 500}),
    filtersOpened: sync('filtersOpened', storeOptions),
    
    selectedTags: localSyncMultiselectFilter('selectedTags', 'availableTags'),

    multiSelectFilters() {
      return [
        {prop: 'tag', selected: this.selectedTags.map(option => option.id), total: this.availableTags.length}
      ];
    },

    groupCollection() {
      let collection = new ImageGroupCollection({
        filterKey: 'project',
        filterValue: this.project.id,
      });
      if(this.searchString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      for(let {prop, selected, total} of this.multiSelectFilters) {
        if(selected.length > 0 && selected.length < total) {
          collection[prop] = {
            in: selected.join()
          };
        }
      }
      return collection;
    },

    nbActiveFilters() {
      return this.$store.getters[this.storeModule + '/nbActiveFilters'];
    },
    nbEmptyFilters() {
      return this.$store.getters[this.storeModule + '/nbEmptyFilters'];
    },

    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
    openedDetails: sync('openedDetails', storeOptions)
  },
  methods: {
    async fetchFilters() {

    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
    },

    async refreshData() {

    },

    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },

    viewerURL(imageGroup) {
      let ids = imageGroup.imageInstances.map(img => img.id);
      return `/project/${imageGroup.project}/image/${ids.join('-')}`;
    }
  },
  async created() {
    try {
      await Promise.all([
        this.fetchTags()
      ]);
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

.image-overview {
  max-height: 4rem;
  max-width: 10rem;
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
