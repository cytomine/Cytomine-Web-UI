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
        <div class="filters">
          <b-input class="search-images search" v-model="searchString" :placeholder="$t('search-placeholder')"
            type="search" icon="search"
          />
          <div class="filter-label">
            {{$t('tags')}}
          </div>
          <div class="filter-body">
            <cytomine-multiselect v-model="selectedTags" :options="availableTags"
              label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
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
          <a class="card-image" @click="addImage(image)" :style="'background-image: url(' + appendShortTermToken(imageThumbUrl(image), shortTermToken) + ')'"></a>
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
import {get,syncMultiselectFilter} from '@/utils/store-helpers';
import {IMAGE_FORMAT} from '@/utils/image-utils';

import ImageName from '@/components/image/ImageName';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import {ImageInstanceCollection, TagCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';
import {appendShortTermToken} from '@/utils/token-utils.js';

const storeOptions = {rootModuleProp: 'storeModule'};
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);

export default {
  name: 'image-selector',
  components: {
    ImageName,
    CytomineMultiselect
  },
  data() {
    return {
      images: [],
      availableTags:[],
      searchString: '',
      nbImagesDisplayed: 20,
      loading: true,
      error: false
    };
  },
  computed: {
    project: get('currentProject/project'),
    shortTermToken: get('currentUser/shortTermToken'),
    selectedTags: localSyncMultiselectFilter('selectedTags', 'availableTags'),
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

      return filtered;
    },
    displayedImages() {
      return this.filteredImages.slice(0, this.nbImagesDisplayed);
    }
  },
  watch:{
    async selectedTags(){
      if(!this.selectedTags.length){
        this.images = [];
      }
      else{
        await this.fetchImages();
      }
    }
  },
  methods: {
    appendShortTermToken,
    async addImage(image) {
      try {
        await image.fetch(); // refetch image to ensure we have latest version
        let slice = await image.fetchReferenceSlice();
        await this.$store.dispatch(this.viewerModule + 'addImage', {image, slices: [slice]});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-add-viewer-image')});
      }
    },
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
      this.images = (await collection.fetchAll()).array; // TODO: should not load full array, should be done with backend
    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
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
    },
    imageThumbUrl(image) {
      return image.thumbURL(256, IMAGE_FORMAT);
    }
  },
  async created() {
    try {
      await this.fetchImages();
      await this.fetchTags();
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
</style>
