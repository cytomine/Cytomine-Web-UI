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
                <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" :multiple="true" />
              </div>
            </div>

            <div class="column filter is-one-quarter">
              <div class="filter-label">
                {{$t('vendor')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedVendors" :options="availableVendors" :multiple="true" />
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('magnification')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect :multiple="true" :searchable="false"
                    v-model="selectedMagnifications" :options="availableMagnifications" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('resolution')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect :multiple="true" :searchable="false"
                    v-model="selectedResolutions" :options="availableResolutions" />
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

      <b-table
        :data="filteredImages"
        class="table-images"
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

        <template #default="{row: image}">
          <b-table-column :label="$t('overview')" width="100">
            <router-link :to="`/project/${image.project}/image/${image.id}`">
              <img :src="image.thumb" class="image-overview">
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
            @delete="deleteImage(image.id)"
            @setResolution="(event) => setResolution(image, event)"
            @setMagnification="(event) => setMagnification(image, event)"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-image')}}</p>
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

    <add-image-modal :active.sync="addImageModal" :idsImages="idsAbstractImages" @addImage="addImage" />
  </div>
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter, syncBoundsFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ImageName from './ImageName';
import ImageDetails from './ImageDetails';
import AddImageModal from './AddImageModal';

import vendorFromMime from '@/utils/vendor';

import {ImageInstanceCollection} from 'cytomine-client';

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
      ]
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
    idsAbstractImages() {
      return this.images.map(i => i.baseImage);
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },

    searchString: sync('searchString', storeOptions),
    filtersOpened: sync('filtersOpened', storeOptions),

    availableFormats() {
      let formats = [];
      this.images.forEach(image => {
        if(!formats.includes(image.extension)) {
          formats.push(image.extension);
        }
      });
      return formats;
    },
    availableVendors() {
      let vendors = [];
      this.images.forEach(image => {
        let vendor = image.vendorFormatted;
        if(!vendors.includes(vendor)) {
          vendors.push(vendor);
        }
      });
      return vendors;
    },
    availableMagnifications() {
      let magnifications = [];
      this.images.forEach(image => {
        let magn = image.magnificationFormatted;
        if(!magnifications.includes(magn)) {
          magnifications.push(magn);
        }
      });
      return magnifications;
    },
    availableResolutions() {
      let resolutions = [];
      this.images.forEach(image => {
        let res = image.resolutionFormatted;
        if(!resolutions.includes(res)) {
          resolutions.push(res);
        }
      });
      return resolutions;
    },
    maxWidth() {
      return Math.max(100, ...this.images.map(image => image.width));
    },
    maxHeight() {
      return Math.max(100, ...this.images.map(image => image.height));
    },
    maxNbUserAnnotations() {
      return Math.max(100, ...this.images.map(image => image.numberOfAnnotations));
    },
    maxNbJobAnnotations() {
      return Math.max(100, ...this.images.map(image => image.numberOfJobAnnotations));
    },
    maxNbReviewedAnnotations() {
      return Math.max(100, ...this.images.map(image => image.numberOfReviewedAnnotations));
    },

    selectedFormats: localSyncMultiselectFilter('formats', 'availableFormats'),
    selectedVendors: localSyncMultiselectFilter('vendors', 'availableVendors'),
    selectedMagnifications: localSyncMultiselectFilter('magnifications', 'availableMagnifications'),
    selectedResolutions: localSyncMultiselectFilter('resolutions', 'availableResolutions'),
    boundsWidth: localSyncBoundsFilter('boundsWidth', 'maxWidth'),
    boundsHeight: localSyncBoundsFilter('boundsHeight', 'maxHeight'),
    boundsUserAnnotations: localSyncBoundsFilter('boundsUserAnnotations', 'maxNbUserAnnotations'),
    boundsJobAnnotations: localSyncBoundsFilter('boundsJobAnnotations', 'maxNbJobAnnotations'),
    boundsReviewedAnnotations: localSyncBoundsFilter('boundsReviewedAnnotations', 'maxNbReviewedAnnotations'),

    filteredImages() {
      return this.$store.getters[this.storeModule + '/filteredImages'](this.images);
    },
    nbActiveFilters() {
      return this.$store.getters[this.storeModule + '/nbActiveFilters'];
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
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },

    async deleteImage(idDeleted) {
      this.images = this.images.filter(image => image.id !== idDeleted);
    },

    updateSort(field, order) {
      this.sort = {field, order};
    },

    addImage(image) {
      this.images.unshift(this.formatImage(image));
    },

    setResolution(image, resolution) {
      image.resolution = resolution;
      this.formatImage(image);
    },

    setMagnification(image, magnification) {
      image.magnification = magnification;
      this.formatImage(image);
    },

    formatImage(image) {
      // use $set to make the new props reactive
      this.$set(image, 'resolutionFormatted', this.formatResolution(image.resolution));
      this.$set(image, 'vendor', vendorFromMime(image.mime));
      this.$set(image, 'vendorFormatted', this.formatVendor(image.vendor));
      this.$set(image, 'magnificationFormatted', this.formatMagnification(image.magnification));
      return image;
    },

    formatResolution(resolution) {
      return resolution ? `${resolution.toFixed(3)} ${this.$t('um-per-pixel')}` : this.$t('unknown');
    },

    formatVendor(vendor) {
      return vendor ? vendor.name : this.$t('unknown');
    },

    formatMagnification(magnification) {
      return magnification || this.$t('unknown');
    }
  },
  async created() {
    try {
      this.images = (await ImageInstanceCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      this.images.forEach(image => this.formatImage(image));

      // if an image was deleted, the currentPage value might not be valid => reinitialize it
      if((this.currentPage - 1)*this.perPage >= this.filteredImages.length) {
        this.currentPage = 1;
      }

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
