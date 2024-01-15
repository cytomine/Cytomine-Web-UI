<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

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

      <metadata-search
        v-if="filtersOpened"
        :formats="availableFormats"
        :image-ids="imageIds"
        :magnifications="availableMagnifications"
        :max-height="maxHeight"
        :max-width="maxWidth"
        :max-nb-job-annotations="maxNbJobAnnotations"
        :max-nb-reviewed-annotations="maxNbReviewedAnnotations"
        :max-nb-user-annotations="maxNbUserAnnotations"
        :metadata="metadata"
        :resolutions="availableResolutions"
        :tags="availableTags"
        :vendors="availableVendors"
      />

      <cytomine-table
        :collection="imageCollection"
        :is-empty="nbEmptyFilters > 0"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :openedDetailed.sync="openedDetails"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :revision="revision"
      >
        <template #default="{row: image}">
          <b-table-column :label="$t('overview')" width="100" :visible="isPropDisplayed('overview')">
            <router-link :to="`/project/${image.project}/image/${image.id}`">
              <image-thumbnail :image="image" :size="128" :key="`${image.id}-thumb-128`" :extra-parameters="{Authorization: 'Bearer ' + shortTermToken }"/>
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
import MetadataSearch from '@/components/search/MetadataSearch';
import ImageName from './ImageName';
import ImageDetails from './ImageDetails';
import AddImageModal from './AddImageModal';
import vendorFromFormat from '@/utils/vendor';

import {ImageInstanceCollection, PropertyCollection, TagCollection} from 'cytomine-client';
import ImageThumbnail from '@/components/image/ImageThumbnail';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'list-images',
  components: {
    ImageThumbnail,
    ImageName,
    ImageDetails,
    CytomineTable,
    AddImageModal,
    MetadataSearch,
  },
  data() {
    return {
      loading: true,
      error: false,
      images: [],
      metadata: {},
      filteredImageIDs: [],
      addImageModal: false,
      excludedProperties: [
        'overview',
        'instanceFilename',
        'magnification',
        'numberOfAnnotations',
        'numberOfJobAnnotations',
        'numberOfReviewedAnnotations',
        'size'
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
    shortTermToken: get('currentUser/shortTermToken'),
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
        {prop: 'contentType', selected: this.selectedContentTypes, total: this.availableFormats.length},
        {prop: 'vendor', selected: this.selectedVendors.map(option => option.value), total: this.availableVendors.length},
        {prop: 'magnification', selected: this.selectedMagnifications.map(option => option.value), total: this.availableMagnifications.length},
        {prop: 'physicalSizeX', selected: this.selectedResolutions.map(option => option.value), total: this.availableResolutions.length},
        {prop: 'tag', selected: this.selectedTags.map(option => option.id), total: this.availableTags.length}
      ];
    },

    selectedContentTypes() {
      let selectedVendors = this.selectedVendors.map(option => option.value);
      let availableVendors = this.availableVendors.map(option => option.value);
      let allowUnknown = selectedVendors.includes('null');
      return this.selectedFormats.filter(ct => (availableVendors.includes(ct)) ? selectedVendors.includes(ct) : allowUnknown);
    },

    boundsFilters() {
      return [
        {prop: 'width', bounds: this.boundsWidth, max: this.maxWidth},
        {prop: 'height', bounds: this.boundsHeight, max: this.maxHeight},
        {prop: 'numberOfAnnotations', bounds: this.boundsUserAnnotations, max: this.maxNbUserAnnotations},
        {prop: 'numberOfJobAnnotations', bounds: this.boundsJobAnnotations, max: this.maxNbJobAnnotations},
        {prop: 'numberOfReviewedAnnotations', bounds: this.boundsReviewedAnnotations, max: this.maxNbReviewedAnnotations},
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
      for(let {prop, bounds, max} of this.boundsFilters) {
        collection[prop] = {};
        if (bounds[1]!==max) {
          // if max bounds is the max possible value, do not set the filter in the request
          // so that if an event (ex: algo creates an annotation) happens between the bounds request and the query request
          // the image will not be skipped from the result
          collection[prop] = {
            lte: bounds[1]
          };
        }
        if(bounds[0] > 0) collection[prop]['gte'] = bounds[0];
      }
      for(let {prop, selected, total} of this.multiSelectFilters) {
        if(selected.length > 0 && selected.length < total) {
          collection[prop] = {
            in: selected.join()
          };
        }
      }

      let filteredIDs = [];
      this.selectedFormats.forEach(format => filteredIDs = filteredIDs.concat(this.filteredImageIDs[format]));
      if (filteredIDs.length === 0) {
        for (let ids of Object.values(this.filteredImageIDs)) {
          filteredIDs = filteredIDs.concat(ids);
        }
      }

      if (filteredIDs.length > 0) {
        collection['include'] = {
          in: filteredIDs.join(',')
        };
      }

      return collection;
    },

    imageIds() {
      let ids = {};
      this.availableFormats.forEach(format => ids[format] = []);
      this.images.forEach(image => ids[image.contentType].push(image.baseImage));

      return ids;
    },

    nbActiveFilters() {
      return this.$store.getters[this.storeModule + '/nbActiveFilters'];
    },
    nbEmptyFilters() {
      return this.$store.getters[this.storeModule + '/nbEmptyFilters'] + ((this.selectedContentTypes.length > 0) ? 0 : 1);
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

      stats.format.list.forEach(format => {
        let vendor = vendorFromFormat(format);
        let vendorFormatted = {
          value: vendor ? format : 'null',
          label: vendor ? vendor.name : this.$t('unknown')
        };

        if (!this.availableVendors.find(vendor => vendor.value === vendorFormatted.value)) {
          this.availableVendors.push(vendorFormatted);
        }

        this.filteredImageIDs[format] = [];
      });

      this.availableMagnifications = stats.magnification.list.map(m => {
        return {
          value: m || 'null',
          label: m || this.$t('unknown')
        };
      });
      // this.availableResolutions = stats.resolution.list.map(resolution => {
      //   return {
      //     value: resolution || 'null',
      //     label: resolution ? `${resolution.toFixed(3)} ${this.$t('um-per-pixel')}` : this.$t('unknown')
      //   };
      // });
    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
    },
    async fetchImages() {
      this.images = (await ImageInstanceCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id,
      })).array;

      await Promise.all(this.images.map(async (image) => {
        let properties = (await PropertyCollection.fetchAll({object: image})).array;
        properties.sort((a, b) => a.key.localeCompare(b.key));

        if (!(image.contentType in this.metadata)) {
          this.metadata[image.contentType] = {};
        }

        this.metadata[image.contentType][image.id] = properties;
        this.filteredImageIDs[image.contentType].push(image.baseImage);
      }));
    },

    async refreshData() {
      this.$store.commit('currentProject/resetMetadataFilters');

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
    },
    isPropDisplayed(prop) {
      return this.excludedProperties.includes(prop) && (this.configUI[`project-explore-image-${prop}`] == null || this.configUI[`project-explore-image-${prop}`]);
    },
    includeImageIDs(format, imageIDs) {
      this.$delete(this.filteredImageIDs, format);
      this.$set(this.filteredImageIDs, format, imageIDs);
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
        this.fetchTags(),
        this.fetchImages(),
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
  },
  mounted() {
    this.$eventBus.$on('includeImageIDs', this.includeImageIDs);
  },
  beforeDestroy() {
    this.$eventBus.$off('includeImageIDs', this.includeImageIDs);
  }
};
</script>

<style scoped>
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

::v-deep .image-thumbnail {
  max-height: 4rem;
  max-width: 10rem;
}

.search-block {
  display: flex;
}

::v-deep .search-images {
  max-width: 30rem;
  margin-right: 1rem;
}

::v-deep td, ::v-deep th {
  vertical-align: middle !important;
}
</style>
