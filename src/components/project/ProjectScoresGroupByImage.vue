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
<div class="box error" v-if="false && !configUI['project-scores-tab']">
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
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
          class="search-images"
          v-model="searchImageString"
          :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
      </div>

      <cytomine-table
        :collection="statsCollection"
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
              <img :src="image.thumb.replace(/maxSize=\d+/, 'maxSize='+256)" class="image-overview">
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

          <b-table-column :field="score.name" :label="score.name" centered sortable width="100" v-for="score in scores" :key="score.id">
            {{image[score.id]}}
          </b-table-column>

          <b-table-column field="magnification" :label="$t('magnification')" centered sortable width="100">
            {{ image.magnification || $t('unknown') }}
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



  </div>

  <div class="box">
    <h2 class="has-text-centered"> {{ $t('download-results') }} </h2>
    <div class="buttons is-centered">
      <a class="button is-link" :href="downloadCSV">{{$t('download-CSV')}}</a>
    </div>
  </div>
</div>
</template>

<script>
import {get, sync} from '@/utils/store-helpers';

import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ImageName from '../image/ImageName';
import ImageDetails from '../image/ImageDetails';

import {GenericCollection, Cytomine} from 'cytomine-client';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};

export default {
  name: 'project-scores-group-by-image',
  components: {
    ImageName,
    ImageDetails,
    CytomineTable,
    CytomineMultiselect,
    CytomineSlider,
  },
  data() {
    return {
      loading: true,
      error: false,
      images: [],
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
      revision: 0,
      imageScoresByImages: {},
      searchImageString: ''
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    scores: get('currentProject/scores'),
    blindMode() {
      return this.project.blindMode;
    },
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },

    // searchImageString: sync('searchImageString', {...storeOptions, debounce: 500}),

    statsCollection() {
      let collection = new GenericCollection({
        path: `project/${this.project.id}/image-score/stats-group-by-image.json`
      });
      if(this.searchImageString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchImageString)
        };
      }
      return collection;
    },
    downloadCSV() {
      let filter = '';
      if(this.searchImageString) {
        filter = '?name[ilike]=' + this.searchImageString;
      }
      return Cytomine.instance.host + `/api/project/${this.project.id}/image-score/stats-group-by-image.csv${filter}`;
    },
    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
    openedDetails: sync('openedDetails', storeOptions)
  },
  methods: {

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
  async created() {
    try {
      await Promise.all([
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
