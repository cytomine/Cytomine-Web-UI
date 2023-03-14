<!--
   Copyright (c) 2009-2023. Authors: see NOTICE file.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->

<template>
  <div class="filters">
    <div class="columns">

      <!-- Misc -->
      <div class="column filter is-one-quarter">
        <h2>Misc</h2>

        <div class="filter-label">{{ $t('tags') }}</div>
        <div class="filter-body">
          <cytomine-multiselect
            v-model="selectedTags"
            :allPlaceholder="$t('all')"
            :multiple="true"
            :options="availableTags"
            label="name"
            track-by="id"
          />
        </div>

        <div class="filter-label">{{ $t('vendor') }}</div>
        <div class="filter-body">
          <cytomine-multiselect
            v-model="selectedVendors"
            :multiple="true"
            :options="availableVendors"
            label="label"
            track-by="value"
          />
        </div>
      </div>

      <!-- Annotations -->
      <div class="column filter is-one-quarter">
        <h2>Annotations</h2>

        <div class="filter-label">{{ $t('user-annotations') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsUserAnnotations" :max="maxNbUserAnnotations"/>
        </div>

        <div class="filter-label">{{ $t('analysis-annotations') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsJobAnnotations" :max="maxNbJobAnnotations"/>
        </div>

        <div class="filter-label">{{ $t('reviewed-annotations') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations"/>
        </div>
      </div>

      <!-- Common Image Metadata -->
      <div class="column filter is-one-quarter">
        <h2>Common Image Metadata</h2>

        <div class="filter-label">{{ $t('magnification') }}</div>
        <div class="filter-body">
          <cytomine-multiselect
            v-model="selectedMagnifications"
            :options="availableMagnifications"
            :multiple="true"
            :searchable="false"
            label="label"
            track-by="value"/>
        </div>

        <div class="filter-label">{{ $t('resolution') }}</div>
        <div class="filter-body">
          <cytomine-multiselect
            v-model="selectedResolutions"
            :options="availableResolutions"
            :multiple="true"
            :searchable="false"
            label="label"
            track-by="value"/>
        </div>

        <div class="filter-label">{{ $t('width') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsWidth" :max="maxWidth"/>
        </div>

        <div class="filter-label">{{ $t('height') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsHeight" :max="maxHeight"/>
        </div>
      </div>

      <!-- Specific Format Metadata -->
      <div class="column filter is-one-quarter">
        <h2>Specific Image Metadata</h2>

        <div class="filter-label">{{ $t('format') }}</div>
        <div class="filter-body">
          <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" multiple/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {get, sync, syncBoundsFilter, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import vendorFromFormat from '@/utils/vendor';

import {ImageInstanceCollection} from 'cytomine-client';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'list-images',
  components: {
    CytomineMultiselect,
    CytomineSlider,
  },
  props: {
    formats: Array,
    tags: Array,
  },
  data() {
    return {
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
      availableFormats: this.formats,
      availableVendors: [],
      availableMagnifications: [],
      availableResolutions: [],
      availableTags: this.tags,
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
        {
          prop: 'magnification',
          selected: this.selectedMagnifications.map(option => option.value),
          total: this.availableMagnifications.length
        },
        {
          prop: 'physicalSizeX',
          selected: this.selectedResolutions.map(option => option.value),
          total: this.availableResolutions.length
        },
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
        {prop: 'width', bounds: this.boundsWidth},
        {prop: 'height', bounds: this.boundsHeight},
        {prop: 'numberOfAnnotations', bounds: this.boundsUserAnnotations},
        {prop: 'numberOfJobAnnotations', bounds: this.boundsJobAnnotations},
        {prop: 'numberOfReviewedAnnotations', bounds: this.boundsReviewedAnnotations},
      ];
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

      stats.format.list.forEach(format => {
        let vendor = vendorFromFormat(format);
        let vendorFormatted = {
          value: vendor ? format : 'null',
          label: vendor ? vendor.name : this.$t('unknown')
        };

        if (!this.availableVendors.find(vendor => vendor.value === vendorFormatted.value)) {
          this.availableVendors.push(vendorFormatted);
        }
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
  },
  async created() {
    try {
      await Promise.all([
        this.fetchFilters(),
      ]);
    }
    catch (error) {
      console.log(error);
    }
  }
};
</script>
