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
      <div class="column filter is-one-third">
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

        <div class="filter-label">{{ $t('format') }}</div>
        <div class="filter-body">
          <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" multiple/>
        </div>
      </div>

      <!-- Common Image Metadata -->
      <div class="column filter is-one-third">
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

      <!-- Annotations -->
      <div class="column filter is-one-third">
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
    </div>

    <div class="columns is-multiline">
      <div class="column is-half" v-for="format in selectedFormats" :key="format">
        <metadata-filter
          :format="format"
          :image-ids="imageIds[format]"
          :keys="metadataKeys[format]"
          :max="metadataMax"
          :type="metadataType"
        />
      </div>
    </div>

  </div>
</template>

<script>
import {isNumeric} from '@/utils/string-utils';
import {stripIDfromKey} from '@/utils/metadata.js';
import {syncBoundsFilter, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import MetadataFilter from '@/components/search/MetadataFilter.vue';

const storeOptions = {rootModuleProp: 'storeModule'};
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'metadata-search',
  components: {
    CytomineMultiselect,
    CytomineSlider,
    MetadataFilter,
  },
  props: {
    formats: {type: Array, default: () => []},
    imageIds: {type: Object, default: null},
    magnifications: {type: Array, default: () => []},
    maxHeight: {type: Number, default: 0},
    maxWidth: {type: Number, default: 0},
    maxNbJobAnnotations: {type: Number, default: 0},
    maxNbReviewedAnnotations: {type: Number, default: 0},
    maxNbUserAnnotations: {type: Number, default: 0},
    metadata: {type: Object, default: null},
    resolutions: {type: Array, default: () => []},
    tags: {type: Array, default: () => []},
    vendors: {type: Array, default: () => []},
  },
  data() {
    return {
      availableFormats: this.formats,
      availableVendors: this.vendors,
      availableMagnifications: this.magnifications,
      availableResolutions: this.resolutions,
      availableTags: this.tags,
      metadataKeys: {},
      metadataMax: {},
      metadataType: {},
      showSpecificMetadata: {},
    };
  },
  computed: {
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

    storeModule() {
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
  },
  async created() {
    this.selectedFormats.forEach(format => this.showSpecificMetadata[format] = true);

    for (const [key, value] of Object.entries(this.metadata)) {
      let keys = new Set();
      Object.values(value).forEach(properties => {
        properties.forEach(property => {
          let key = stripIDfromKey(property.key);
          keys.add(key);
          this.metadataType[key] = isNumeric(property.value) ? Number : String;
          if (key.toLowerCase().includes('date')) {
            this.metadataType[key] = Date;
          }

          if (!(key in this.metadataMax)) {
            this.metadataMax[key] = property.value;
          }

          if (this.metadataMax[key] < property.value) {
            this.metadataMax[key] = isNumeric(property.value) ? +property.value : property.value;
          }
        });
      });
      this.metadataKeys[key] = Array.from(keys);
    }
  }
};
</script>
