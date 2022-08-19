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
<div>
  <div class="image-selector-wrapper" v-show="imageSelectorEnabled">
    <b-loading :is-full-page="false" :active="loading" />
    <template v-if="!loading">
      <div class="header">

        <div class="columns" style="width:100%;">
          <div class="column is-2">
            <b-input class="search-images search" v-model="searchString" :placeholder="$t('search-placeholder')"
                     type="search" icon="search"
            />
          </div>
          <div class="column is-2">
            <button class="button" @click="toggleFilterDisplay()">
              <span class="icon">
                <i class="fas fa-filter"></i>
              </span>
                  <span>
                {{filtersOpened ? $t('button-hide-filters') : $t('button-show-filters')}}
              </span>
            </button>
          </div>
          <div class="column is-8">

            <b-collapse :open="filtersOpened">
              <div class="filters">
                <div class="filter-label">
                  {{$t('tags')}}
                </div>
                <div class="filter-body">
                  <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                    label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
                </div>

                <div class="filter-label" v-if="ontology">
                  {{$t('terms')}}
                </div>
                <div class="filter-body" v-if="ontology">
                  <cytomine-multiselect v-model="selectedTerms" :options="availableTerms"
                                        label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
                </div>


                <div class="filter-label">
                  {{$t('properties')}}
                </div>

                <b-input
                  :value="searchPropertiesKeyString"
                  @input="debounceSearchPropertiesKeyString"
                  class="search-uploaded-file"
                  :placeholder="$t('key')"
                />

                <b-input
                  :value="searchPropertiesValueString"
                  @input="debounceSearchPropertiesValueString"
                  class="search-uploaded-file"
                  :placeholder="$t('value')"
                />

                <div class="columns">

                  <b-field horizontal :label="score.name" v-for="score in scores" :key="score.id">
                    <b-select size="is-small" v-model="selectedScoreValue[score.id]" @input="event => changeValue()">
                      <option :value="null">

                      </option>
                      <option :value="-1">
                        No value
                      </option>
                      <option v-for="scoreValue in score.values" :value="scoreValue.value" :key="scoreValue.id">
                        {{ scoreValue.value }}
                      </option>
                    </b-select>
                  </b-field>
                </div>
              </div>
            </b-collapse>

          </div>
        </div>


        <button class="delete" @click="imageSelectorEnabled = false"></button>
      </div>

      <div class="content-wrapper" v-if="error">
        <b-message type="is-danger" has-icon icon-size="is-small">
          <h2> {{ $t('error') }} </h2>
          <p> {{ $t('unexpected-error-info-message') }} </p>
        </b-message>
      </div>




      <div v-else class="image-selector">
        <div class="card" v-for="image in displayedImages" :key="image.id">
          <a class="card-image" @click="addImage(image)" :style="'background-image: url(' + image.preview + ')'"></a>
          <div class="card-content">
            <div class="content">
              <a @click="addImage(image)">
                <image-name :image="image" />
              </a>
            </div>
          </div>
        </div>

        <button class="button" v-if="nbImagesDisplayed < filteredImages.length" @click="more()">
          {{$t('button-more')}}
        </button>

        <div class="space">&nbsp;</div>
      </div>
    </template>
  </div>

  <a
    class="image-selector-button"
    @click="imageSelectorEnabled = true"
    v-tooltip="{content: $t('add-image'), placement: 'left'}"
  >
    <i class="fas fa-plus"></i>
  </a>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import ImageName from '@/components/image/ImageName';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import {ImageInstanceCollection, TagCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';
import OntologyTreeMultiselect from '@/components/ontology/OntologyTreeMultiselect';
import _ from 'lodash';
export default {
  name: 'image-selector',
  components: {
    ImageName,
    CytomineMultiselect,
    OntologyTreeMultiselect
  },
  data() {
    return {
      images: [],
      selectedTags: [],
      availableTags:[],
      selectedTerms: [],
      availableTerms:[],
      searchString: '',
      searchPropertiesKeyString: '',
      searchPropertiesValueString: '',
      nbImagesDisplayed: 20,
      loading: true,
      error: false,
      filtersOpened: false,
      selectedScoreValue: {}
    };
  },
  computed: {
    project: get('currentProject/project'),
    scores: get('currentProject/scores'),
    ontology: get('currentProject/ontology'),
    storeModule() {
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageSelectorEnabled: {
      get() {
        return this.$store.getters['currentProject/currentViewer'].imageSelector;
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setImageSelector', value);
      }
    },
    filteredImages() { // TODO: in backend
      let filtered = this.images;
      if(this.searchString) {
        let regexp = getWildcardRegexp(this.searchString);
        filtered =  filtered.filter(image => regexp.test(image.instanceFilename));
      }

      for (const [key, value] of Object.entries(this.selectedScoreValue)) {
        console.log(`${key}: ${value}`);
        console.log(filtered);
        if (value!=null && value!==-1) {
          filtered =  filtered.filter(image => image['score' + key]!=null && image['score' + key]==value );
        }
        else if(value===-1) {
          filtered =  filtered.filter(image => image['score' + key]==null );
        }
      }
      return filtered;
    },
    displayedImages() {
      return this.filteredImages.slice(0, this.nbImagesDisplayed);
    }
  },
  watch:{
    async selectedTags(){
      await this.fetchImages();
    },
    async selectedTerms(){
      await this.fetchImages();
    },
    async searchPropertiesKeyString(){
      await this.fetchImages();
    },
    async searchPropertiesValueString(){
      await this.fetchImages();
    },
  },
  methods: {
    changeValue() {

    },
    async addImage(image) {
      try {
        await image.fetch(); // refetch image to ensure we have latest version
        let slice = await image.fetchReferenceSlice();
        await this.$store.dispatch(this.viewerModule + 'addImage', {image, slice});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-add-viewer-image')});
      }
    },
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },
    debounceSearchPropertiesKeyString: _.debounce(async function(value) {
      this.searchPropertiesKeyString = value;
    }, 500),
    debounceSearchPropertiesValueString: _.debounce(async function(value) {
      this.searchPropertiesValueString = value;
    }, 500),
    async fetchImages() {
      let collection = new ImageInstanceCollection({
        filterKey: 'project',
        filterValue: this.project.id,
      });
      if(this.selectedTags.length > 0) {
        collection['tag'] = {
          in: this.selectedTags.map(option => option.id).join()
        };
      }
      if(this.selectedTerms.length > 0) {
        collection['term'] = {
          in: this.selectedTerms.map(option => option.id).join()
        };
      }
      if(this.searchPropertiesKeyString && this.searchPropertiesKeyString!=='') {
        collection['propertyKey'] = {
          ilike: encodeURIComponent(this.searchPropertiesKeyString)
        };
      }

      if(this.searchPropertiesValueString && this.searchPropertiesValueString!=='') {
        collection['propertyValue'] = {
          ilike: encodeURIComponent(this.searchPropertiesValueString)
        };
      }

      this.images = (await collection.fetchAll()).array; // TODO: should not load full array, should be done with backend
    },
    async fetchTags() {
      this.availableTags = (await TagCollection.fetchAll()).array;
      console.log('availableTags', this.availableTags);
    },
    async fetchTerms() {
      this.availableTerms = this.$store.getters['currentProject/terms'] || [];
      console.log('availableTerms', this.availableTerms);
    },
    more() {
      this.nbImagesDisplayed += 20;
    },
    toggle() {
      this.imageSelectorEnabled = !this.imageSelectorEnabled;
    },
    shortkeyHandler(key) {
      if (key === 'toggle-add-image') {
        this.toggle();
      }
    }
  },
  async created() {
    try {
      this.fetchImages();
      this.fetchTags();
      this.fetchTerms();
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    this.loading = false;
  },
  mounted() {
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style scoped>
.image-selector-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  width: 100%;
  height: 20em;
  z-index: 150;
}

.header {
  padding: 0.75em;
  padding-bottom: 0;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
}
.search {
  margin-top: 0.25em;
}
.filters {
  display: flex;
  padding: 0;
  background: None;
}
.filter-label {
  font-size: 0.9em;
  margin-top: 0.7rem;
  margin-left: 1em;
  margin-right: 0.5em;
}
.delete {
  margin-top: 1.2rem;
}
.image-selector {
  width: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  flex: 1;
}
.card {
  display: inline-block;
  min-width: 12em;
  flex: 0;
  box-sizing: border-box;
  margin: 0.75em;
}
.card-image {
  display: inline-block;
  width: 100%;
  height: 9.5em;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: white;
  border-bottom: 1px solid #ddd;
}
.card-content {
  padding: 0.75em;
  font-size: 0.8rem;
  overflow-wrap: break-word;
  overflow: hidden;
  height: 5em;
}
.space {
  margin-left: 0.5em;
}
.image-selector-button {
  background: #95b5db;
  border: 0.35rem solid white;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  text-align: center;
  line-height: 2.8rem;
  color: white;
  font-size: 1.8rem;
  box-sizing: border-box;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  z-index: 100;
}

.filters {
  margin-top: 0px;
}
.field {
  margin-right: 10px;
}
.field-label .is-normal {
  padding-top: 0px;
  margin-right: 0.5rem;
}
</style>
