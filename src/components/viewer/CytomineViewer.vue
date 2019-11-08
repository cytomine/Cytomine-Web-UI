<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

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
<div v-if="error" class="box error">
  <h2> {{ $t('error') }} </h2>
  <p>{{ $t('error-loading-image') }}</p>
</div>
<div v-else class="cytomine-viewer">
  <b-loading :is-full-page="false" :active="loading" />
  <div v-if="!loading" class="maps-wrapper">
    <div class="map-cell"
      v-for="(cell, i) in cells"
      :key="i"
      :style="`height:${elementHeight}%; width:${elementWidth}%;`"
    >
      <cytomine-image
        v-if="cell && cell.image"
        :index="cell.index"
        :key="`${cell.index}-${cell.image.id}`"
        @close="closeMap(cell.index)"
      />
    </div>

    <image-selector />

    <!-- Emit event when a hotkey is pressed (to rework once https://github.com/iFgR/vue-shortkey/issues/78 is implemented) -->
    <div class="hidden" v-shortkey.once="shortkeysMapping" @shortkey="shortkeyEvent"></div>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import CytomineImage from './CytomineImage';
import ImageSelector from './ImageSelector';

import viewerModuleModel from '@/store/modules/project_modules/viewer';

import constants from '@/utils/constants.js';

import {ImageInstance} from 'cytomine-client';

export default {
  name: 'cytomine-viewer',
  components: {
    CytomineImage,
    ImageSelector
  },
  data() {
    return {
      error: false,
      loading: true,
      reloadInterval: null,
      idViewer: null
    };
  },
  computed: {
    project: get('currentProject/project'),
    viewers() {
      return this.$store.state.projects[this.project.id].viewers;
    },
    idImages() {
      return this.$route.params.idImages.split('-');
    },
    paramIdViewer() {
      return this.$route.query.viewer;
    },
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    viewer() {
      return this.viewers[this.idViewer];
    },
    indexImages() {
      return this.viewer ? Object.keys(this.viewer.images) : [];
    },
    nbImages() {
      return this.indexImages.length;
    },
    nbHorizontalCells() {
      return Math.ceil(Math.sqrt(this.nbImages));
    },
    nbVerticalCells() {
      return this.nbHorizontalCells ? Math.ceil(this.nbImages/this.nbHorizontalCells) : 0;
    },
    cells() {
      let cells = new Array(this.nbHorizontalCells*this.nbVerticalCells);
      for(let i = 0; i < this.nbImages; i++) {
        let index = this.indexImages[i];
        let image = this.viewer.images[index].imageInstance;
        cells[i] = {index, image};
      }
      return cells;
    },
    elementHeight() {
      return 100/this.nbVerticalCells;
    },
    elementWidth() {
      return 100/this.nbHorizontalCells;
    },
    shortkeysMapping() {
      // for shortkeys composed of a single key, return the key as srcKey
      let mapping = ['s', 'o', 'f', 'd', 'p', 'n', 'a', 'r', 't'].reduce((object, key) => {
        object[key] = [key];
        return object;
      }, {});
      mapping.ctrlZ = ['ctrl', 'z']; // special handling because combination of keys should trigger the function
      mapping.ctrlY = ['ctrl', 'y']; // idem
      return mapping;
    }
  },
  watch: {
    paramIdViewer() {
      this.findIdViewer();
    },
    idViewer(_, old) {
      if(old) {
        this.loading = true;
        this.loadViewer();
      }
    },
    viewer() {
      if(!this.viewer) {
        console.log('Viewer closed from external source');
        this.$router.push(`/project/${this.$route.params.idProject}`);
      }
    },
    nbImages() {
      this.$eventBus.$emit('updateMapSize');
    }
  },
  methods: {
    findIdViewer() {
      if(this.paramIdViewer) {
        this.idViewer = this.paramIdViewer;
        return;
      }

      for(let id in this.viewers) {
        // if viewer containing the targetted images, and only them, store its id
        let imagesViewer = Object.values(this.viewers[id].images).map(img => img.imageInstance.id).join('-');
        if(imagesViewer === this.$route.params.idImages) {
          this.idViewer = id;
          return;
        }
      }

      this.idViewer = Math.random().toString(36).substr(2, 9);
    },

    closeMap(index) {
      if(this.nbImages === 1) {
        this.$store.unregisterModule(['projects', this.project.id, 'viewers', this.idViewer]);
        this.$router.push(`/project/${this.$route.params.idProject}`);
      }
      else {
        this.$store.dispatch(this.viewerModule + 'removeImage', index);
      }
    },

    async loadViewer() {
      try {
        this.$store.commit('currentProject/setCurrentViewer', this.idViewer);
        if(!this.viewer) {
          this.$store.registerModule(['projects', this.project.id, 'viewers', this.idViewer], viewerModuleModel);

          let images = {};
          //don't fetch multiple times the same image.
          let idImages = [...new Set(this.idImages)];
          await Promise.all(idImages.map(async id => {
            let image = await ImageInstance.fetch(id);
            images[id] = image;
          }));

          this.idImages.forEach(async id => {
            await this.$store.dispatch(this.viewerModule + 'addImage', images[id]);
          });
        }
        else {
          await this.$store.dispatch(this.viewerModule + 'refreshData');
        }
        this.loading = false;
      }
      catch(err) {
        console.log(err);
        this.error = true;
      }
    },

    shortkeyEvent(event) {
      this.$eventBus.$emit('shortkeyEvent', event.srcKey);
    }
  },
  async created() {
    this.findIdViewer();
    await this.loadViewer();
    this.reloadInterval = setInterval(
      () => this.$eventBus.$emit('reloadAnnotations'),
      constants.VIEWER_ANNOTATIONS_REFRESH_INTERVAL
    );
  },
  beforeDestroy() {
    clearInterval(this.reloadInterval);
  }
};
</script>

<style scoped>
.cytomine-viewer {
  height: 100%;
}

.maps-wrapper {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
}

.map-cell {
  border-top: 0.2em solid #222;
  overflow: hidden;
}

.hidden {
  display: none;
}
</style>
