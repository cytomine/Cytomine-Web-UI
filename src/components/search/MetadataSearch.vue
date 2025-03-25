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

        <div class="filter-label">{{ $t('reviewed-annotations') }}</div>
        <div class="filter-body">
          <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {syncBoundsFilter, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';

const storeOptions = {rootModuleProp: 'storeModule'};
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
const localSyncBoundsFilter = (filterName, maxProp) => syncBoundsFilter(null, filterName, maxProp, storeOptions);

export default {
  name: 'metadata-search',
  components: {
    CytomineMultiselect,
    CytomineSlider,
  },
  props: {
    formats: {type: Array, default: () => []},
    imageIds: {type: Object, default: null},
    magnifications: {type: Array, default: () => []},
    maxHeight: {type: Number, default: 0},
    maxWidth: {type: Number, default: 0},
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
    boundsReviewedAnnotations: localSyncBoundsFilter('boundsReviewedAnnotations', 'maxNbReviewedAnnotations'),

    storeModule() {
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
  },
};
</script>
