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
    <p class="panel-heading">
      {{$t('images')}}
      <button v-if="canAddImage" class="button is-link" @click="addImageModal = true">
        {{$t('button-add-image')}}
      </button>
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
                {{$t('format')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" multiple />
              </div>
            </div>

            <div class="column filter is-one-quarter">
              <div class="filter-label">
                {{$t('vendor')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedVendors" :options="availableVendors"
                    :multiple="true" label="label" track-by="value"/>
              </div>
            </div>

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

          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('magnification')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedMagnifications" :options="availableMagnifications"
                    :multiple="true" :searchable="false" label="label" track-by="value"/>
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('resolution')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedResolutions" :options="availableResolutions"
                    :multiple="true" :searchable="false" label="label" track-by="value" />
              </div>
            </div>

            <div class="column">
              <div class="filter-label">
                {{$t('width')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsWidth" :max="maxWidth" />
              </div>
            </div>

            <div class="column">
              <div class="filter-label">
                {{$t('height')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsHeight" :max="maxHeight" />
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('user-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsUserAnnotations" :max="maxNbUserAnnotations" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('analysis-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsJobAnnotations" :max="maxNbJobAnnotations" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('reviewed-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations" />
              </div>
            </div>

            <div class="column filter"></div>
          </div>
        </div>
      </b-collapse>

      <cytomine-table
        :collection="imageCollection"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :openedDetailed.sync="openedDetails"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :revision="revision"
      >
        <template #default="{row: image}">
          <b-table-column :label="$t('overview')" width="100">
            <router-link :to="`/project/${image.project}/image/${image.id}`">
              <img :src="image.thumbURL(256)" class="image-overview">
            </router-link>
          </b-table-column>

          <b-table-column
            :field="blindMode ? 'blindedName' : 'instanceFilename'"
            :label="$t('name')"
            sortable
            width="400"
          >
            <router-link :to="`/project/${image.project}/image/${image.id}`">
              <image-name :image="image" showBothNames />
            </router-link>
          </b-table-column>

          <b-table-column field="magnification" :label="$t('magnification')" centered sortable width="100">
            {{ image.magnification || $t('unknown') }}
          </b-table-column>

          <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="100">
            <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=user`">
              {{ image.numberOfAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column field="numberOfJobAnnotations" :label="$t('analysis-annotations')" centered sortable width="100">
            <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
              {{ image.numberOfJobAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="100">
            <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
              {{ image.numberOfReviewedAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column label=" " centered width="150">
            <router-link :to="`/project/${image.project}/image/${image.id}`" class="button is-small is-link">
              {{$t('button-open')}}
            </router-link>
          </b-table-column>
        </template>

        <template #detail="{row: image}">
          <image-details
            :image="image"
            :excludedProperties="excludedProperties"
            editable
            @delete="refreshData"
            @setResolution="refreshData"
            @setMagnification="refreshData"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-image')}}</p>
          </div>
        </template>
      </cytomine-table>
    </div>

    <add-image-modal :active.sync="addImageModal" @addImage="refreshData" />
  </div>
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter, syncBoundsFilter} from '@/utils/store-helpers';

import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ImageName from './ImageName';
import ImageDetails from './ImageDetails';
import AddImageModal from './AddImageModal';
import vendorFromMime from '@/utils/vendor';

import {ImageInstanceCollection, TagCollection} from 'cytomine-client';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'list-images',
  components: {
    ImageName,
    ImageDetails,
    CytomineTable,
    CytomineMultiselect,
    CytomineSlider,
    AddImageModal
  },
  data() {
    return {
      loading: true,
      error: false,
      images: [],
      addImageModal: false,
      excludedProperties: [
        'overview',
        'instanceFilename',
        'magnification',
        'numberOfAnnotations',
        'numberOfJobAnnotations',
        'numberOfReviewedAnnotations'
      ],
      availableFormats: [],
      availableVendors: [],
      availableMagnifications: [],
      availableResolutions: [],
      availableTags:[],
      maxWidth: 100,
      maxHeight: 100,
      maxNbUserAnnotations: 100,
      maxNbJobAnnotations: 100,
      maxNbReviewedAnnotations: 100,
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
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },

    searchString: sync('searchString', {...storeOptions, debounce: 500}),
    filtersOpened: sync('filtersOpened', storeOptions),

    querySearchTags() {
      return this.$route.query.tags;
    },
    selectedFormats: localSyncMultiselectFilter('formats', 'availableFormats'),
    selectedVendors: localSyncMultiselectFilter('vendors', 'availableVendors'),
    selectedTags: localSyncMultiselectFilter('selectedTags', 'availableTags'),
    selectedMagnifications: localSyncMultiselectFilter('magnifications', 'availableMagnifications'),
    selectedResolutions: localSyncMultiselectFilter('resolutions', 'availableResolutions'),
    boundsWidth: localSyncBoundsFilter('boundsWidth', 'maxWidth'),
    boundsHeight: localSyncBoundsFilter('boundsHeight', 'maxHeight'),
    boundsUserAnnotations: localSyncBoundsFilter('boundsUserAnnotations', 'maxNbUserAnnotations'),
    boundsJobAnnotations: localSyncBoundsFilter('boundsJobAnnotations', 'maxNbJobAnnotations'),
    boundsReviewedAnnotations: localSyncBoundsFilter('boundsReviewedAnnotations', 'maxNbReviewedAnnotations'),

    multiSelectFilters() {
      return [
        {prop: 'extension', selected: this.selectedFormats, total: this.availableFormats.length},
        {prop: 'vendor', selected: this.selectedVendors.map(option => option.value), total: this.availableVendors.length},
        {prop: 'magnification', selected: this.selectedMagnifications.map(option => option.value), total: this.availableMagnifications.length},
        {prop: 'resolution', selected: this.selectedResolutions.map(option => option.value), total: this.availableResolutions.length},
        {prop: 'tag', selected: this.selectedTags.map(option => option.id), total: this.availableTags.length}
      ];
    },

    boundsFilters() {
      return [
        {prop: 'width', bounds: this.boundsWidth},
        {prop: 'height', bounds: this.boundsHeight},
        {prop: 'numberOfAnnotations', bounds: this.boundsUserAnnotations},
        {prop: 'numberOfJobAnnotations', bounds: this.boundsJobAnnotations},
        {prop: 'numberOfReviewedAnnotations', bounds: this.boundsReviewedAnnotations},
      ];
    },

    imageCollection() {
      let collection = new ImageInstanceCollection({
        filterKey: 'project',
        filterValue: this.project.id,
      });
      if(this.searchString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      for(let {prop, bounds} of this.boundsFilters) {
        collection[prop] = {
          lte: bounds[1]
        };
        if(bounds[0] > 0) collection[prop]['gte'] = bounds[0];
      }
      for(let {prop, selected, total} of this.multiSelectFilters) {
        if(prop == 'vendor') prop = 'mimeType';
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

    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
    openedDetails: sync('openedDetails', storeOptions)
  },
  methods: {
    async fetchFilters() {
      let stats = await new ImageInstanceCollection.fetchBounds({project: this.project.id});
      this.maxWidth = Math.max(100, stats.width.max);
      this.maxHeight = Math.max(100, stats.height.max);
      this.maxNbUserAnnotations = Math.max(100, stats.countImageAnnotations.max);
      this.maxNbJobAnnotations = Math.max(100, stats.countImageJobAnnotations.max);
      this.maxNbReviewedAnnotations = Math.max(100, stats.countImageReviewedAnnotations.max);


      this.availableFormats = stats.format.list;
      this.availableVendors = stats.mimeType.list.map(mime => {
        let vendor = vendorFromMime(mime);
        return {
          value: mime || 'null',
          label: vendor ? vendor.name : this.$t('unknown')
        };
      });
      this.availableMagnifications = stats.magnification.list.map(m => {
        return {
          value: m || 'null',
          label: m || this.$t('unknown')
        };
      });
      this.availableResolutions = stats.resolution.list.map(resolution => {
        return {
          value: resolution || 'null',
          label: resolution ? `${resolution.toFixed(3)} ${this.$t('um-per-pixel')}` : this.$t('unknown')
        };
      });
    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
    },

    async refreshData() {
      try {
        await Promise.all([
          this.fetchFilters(),
        ]);
        this.revision++;
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },

    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    }
  },
  watch: {
    querySearchTags(values) {
      if(values) {
        this.selectedTags = [];
        let queriedTags = this.availableTags.filter(tag => values.split(',').includes(tag.name));
        if(queriedTags) {
          this.selectedTags = queriedTags;
        }
      }
    }
  },
  async created() {
    try {
      await Promise.all([
        this.fetchFilters(),
        this.fetchTags()
      ]);
      this.loading = false;
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    if(this.$route.query.tags) {
      let queriedTags = this.availableTags.filter(tag => this.$route.query.tags.split(',').includes(tag.name));
      if(queriedTags) {
        this.selectedTags = queriedTags;
      }
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
