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
<cytomine-modal :active="active" :title="$t('add-images')" @close="$emit('update:active', false)">
  <b-loading :is-full-page="false" :active="loading" class="small" />
  <template v-if="!loading">
    <template>
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
        </button>
      </div>

      <b-collapse :open="filtersOpened">
        <div class="filters">
          <div class="columns">
            <div class="column filter is-one-third" v-if="canManageProject">
              <div class="filter-label">
                {{$t('hv-laboratory')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedLab"
                  :options="laboratories"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>

            <div class="column filter is-one-third">
              <div class="filter-label">
                {{$t('hv-staining')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedStaining"
                  :options="stainings"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>

            <div class="column filter is-one-third">
              <div class="filter-label">
                {{$t('hv-antibody')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedAntibody"
                  :options="antibodies"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('hv-dilution')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedDilution"
                  :options="dilutions"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('hv-detection')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedDetection"
                  :options="detections"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>

            <div class="column">
              <div class="filter-label">
                {{$t('hv-instrument')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedInstrument"
                  :options="instruments"
                  :close-on-select="true"
                  label="value" track-by="id"
                  multiple
                />
              </div>
            </div>

          </div>

          <div class="columns">
            <div class="column filter is-one-quarter">
              <div class="filter-label">
                {{$t('tags')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedTags" :options="tags"
                  label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
              </div>
            </div>
          </div>

        </div>
      </b-collapse>

      <cytomine-table
        :collection="imageCollection"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :detailed="false"
      >
        <template #default="{row: image}">
          <b-table-column :label="$t('overview')">
            <img :src="image.previewURL(256)" class="image-overview">
          </b-table-column>

          <b-table-column field="originalFilename" :label="$t('name')" sortable>
            {{ image.originalFilename }}
          </b-table-column>

          <b-table-column field="created" :label="$t('created-on')" sortable>
            {{ Number(image.created) | moment('ll LT') }}
          </b-table-column>

          <b-table-column label=" " centered>
            <button v-if="wasAdded(image)" class="button is-small is-link" disabled>
              {{$t('button-added')}}
            </button>
            <span v-else-if="isInProject(image)">
              {{$t('already-in-project')}}
            </span>
            <button v-else class="button is-small is-link" @click="addImage(image)">
              {{$t('button-add')}}
            </button>
          </b-table-column>
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-image')}}</p>
          </div>
        </template>
      </cytomine-table>
    </template>
  </template>
</cytomine-modal>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {AbstractImageCollection, ImageInstance, HVMetadataCollection, TagCollection} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';
import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';

export default {
  name: 'add-image-modal',
  props: {
    active: Boolean,
  },
  components: {
    CytomineTable,
    CytomineMultiselect,
    CytomineModal
  },
  data() {
    return {
      loading: true,
      perPage: 10,
      searchString: '',
      idsAddedImages: [],
      currentPage: 1,
      sortField: 'created',
      sortOrder: 'desc',
      filtersOpened : false,
      laboratories: [],
      selectedLab: [],
      stainings: [],
      selectedStaining: [],
      antibodies: [],
      selectedAntibody: [],
      dilutions: [],
      selectedDilution: [],
      detections: [],
      selectedDetection: [],
      instruments: [],
      selectedInstrument: [],
      tags: [],
      selectedTags: [],
    };
  },
  computed: {
    project: get('currentProject/project'),
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    multiSelectFilters() {
      return [
        {prop: 'laboratory', selected: this.selectedLab, total: this.laboratories.length},
        {prop: 'staining', selected: this.selectedStaining, total: this.stainings.length},
        {prop: 'antibody', selected: this.selectedAntibody, total: this.antibodies.length},
        {prop: 'dilution', selected: this.selectedDilution, total: this.dilutions.length},
        {prop: 'detection', selected: this.selectedDetection, total: this.detections.length},
        {prop: 'instrument', selected: this.selectedInstrument, total: this.instruments.length},
        {prop: 'tag', selected: this.selectedTags, total: this.tags.length},
      ];
    },
    imageCollection() {
      let collection = new AbstractImageCollection({
        search: true,
        project: this.project.id,
      });
      if(this.searchString) {
        collection['searchText'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      for(let {prop, selected, total} of this.multiSelectFilters) {
        if(selected.length > 0 && selected.length < total) {
          collection[prop] = {
            in: selected.map(s => s.id).join()
          };
        }
      }

      return collection;
    },
  },
  watch: {
    active(val) {
      if(val) {
        this.idsAddedImages = [];
      }
    }
  },
  methods: {
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },
    async loadMetadata(type) {
      let metadatas;
      if(type == 'staining') metadatas = (await HVMetadataCollection.fetchStaining());
      else if(type == 'laboratory') metadatas = (await HVMetadataCollection.fetchLaboratory());
      else if(type == 'antibody') metadatas = (await HVMetadataCollection.fetchAntibody());
      else if(type == 'detection') metadatas = (await HVMetadataCollection.fetchDetection());
      else if(type == 'dilution') metadatas = (await HVMetadataCollection.fetchDilution());
      else if(type == 'instrument') metadatas = (await HVMetadataCollection.fetchInstrument());
      else metadatas = [];
      return metadatas;
    },
    async fetchTags() {
      try {
        this.tags = (await TagCollection.fetchAll()).array.sort((a, b) => a.name.localeCompare(b.name));
      }
      catch(error) {
        console.log(error);
      }
    },
    async addImage(abstractImage) {
      let propsTranslation = {imageName: abstractImage.originalFilename, projectName: this.project.name};
      try {
        let image = await new ImageInstance({baseImage: abstractImage.id, project: this.project.id}).save();
        this.idsAddedImages.push(abstractImage.id);
        this.$emit('addImage', image);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-add-image', propsTranslation)
        });

        let updatedProject = this.project.clone();
        updatedProject.numberOfImages++;
        this.$store.dispatch('currentProject/updateProject', updatedProject);
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-add-image', propsTranslation)
        });
      }
    },
    isInProject(image) {
      return image.inProject;
    },
    wasAdded(image) {
      return this.idsAddedImages.includes(image.id);
    }
  },
  async created() {
    this.loading = false;
    this.laboratories = await this.loadMetadata('laboratory');
    //this.fetchStorages();
    this.stainings = await this.loadMetadata('staining');
    this.antibodies = await this.loadMetadata('antibody');
    this.dilutions = await this.loadMetadata('detection');
    this.detections = await this.loadMetadata('dilution');
    this.instruments = await this.loadMetadata('instrument');
    this.fetchTags();
  }
};
</script>

<style scoped>
>>> .animation-content {
  max-width: 60% !important;
  width: 60%;
}

>>> .modal-card {
  width: 100%;
  height: 80vh;
}

.image-overview {
  max-height: 4rem;
  max-width: 10rem;
}
</style>
