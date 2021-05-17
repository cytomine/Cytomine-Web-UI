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
<div class="annotation-details-playground" ref="playground">
  <vue-draggable-resizable
    v-if="selectedFeature && selectedFeature.properties && reload"
    v-show="displayAnnotDetails"
    class="draggable"
    :parent="true"
    :resizable="false"
    drag-handle=".drag"
    @dragstop="dragStop"
    :w="width" h='auto' :x="positionAnnotDetails.x" :y="positionAnnotDetails.y"
    ref="detailsPanel"
  >
    <div class="actions">
      <h1>{{$t('current-selection')}}</h1>
      <button class="drag button is-small close">
        <i class="fas fa-arrows-alt"></i>
      </button>
      <button class="button is-small close" @click="displayAnnotDetails = false">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="annotation-details-container">
      <annotation-details
        :annotation="selectedFeature.properties.annot"
        :terms="terms"
        :users="allUsers"
        :showImageInfo="false"
        :key="selectedFeature.id"
        :showComments="showComments"
        @addTerm="addTerm"
        @updateTerms="updateTerms()"
        @updateProperties="updateProperties()"
        @centerView="centerViewOnAnnot()"
        @deletion="handleDeletion()"
      />
    </div>
  </vue-draggable-resizable>
</div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable';

import AnnotationDetails from '@/components/annotations/AnnotationDetails';
import {UserCollection, UserJobCollection} from 'cytomine-client';
import {fullName} from '@/utils/user-utils.js';
import {Action, updateTermProperties} from '@/utils/annotation-utils.js';

import WKT from 'ol/format/WKT';

export default {
  name: 'annotations-details-container',
  components: {VueDraggableResizable, AnnotationDetails},
  props: {
    index: String,
    view: Object
  },
  data() {
    return {
      width: 320,
      projectUsers: [],
      userJobs: [],
      reload: true,
      format: new WKT(),
      showComments: false
    };
  },
  computed: {
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    displayAnnotDetails: {
      get() {
        return this.imageWrapper.selectedFeatures.displayAnnotDetails;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setDisplayAnnotDetails', value);
      }
    },
    positionAnnotDetails: {
      get() {
        return this.imageWrapper.selectedFeatures.positionAnnotDetails;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setPositionAnnotDetails', value);
      }
    },
    selectedFeature() {
      return this.$store.getters[this.imageModule + 'selectedFeature'];
    },
    allUsers() {
      let allUsers = this.projectUsers.concat(this.userJobs);
      allUsers.forEach(user => user.fullName = fullName(user));
      return allUsers;
    },
    annot() {
      return this.selectedFeature ? this.selectedFeature.properties.annot : {};
    },
    terms() {
      return this.$store.getters['currentProject/terms'] || [];
    }
  },
  watch: {
    selectedFeature() {
      if(this.selectedFeature) {
        this.displayAnnotDetails = true;
        let targetAnnot = this.imageWrapper.selectedFeatures.showComments;
        this.showComments = (targetAnnot === this.annot.id);
        if(targetAnnot !== null) {
          this.$store.commit(this.imageModule + 'setShowComments', null);
        }
      }
    }
  },
  methods: {
    async fetchUsers() {
      let collection = new UserCollection({
        filterKey: 'project',
        filterValue: this.image.project,
      });

      this.projectUsers = (await collection.fetchAll()).array;
    },
    async fetchUserJobs() {
      this.userJobs = (await UserJobCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.image.project
      })).array;
    },

    centerViewOnAnnot() {
      let geometry = this.format.readGeometry(this.annot.location);
      this.view.fit(geometry, {duration: 500, padding: [10, 10, 10, 10], maxZoom: this.image.depth});
    },

    addTerm(term) {
      this.$store.dispatch(this.viewerModule + 'addTerm', term);
    },

    async updateTerms() {
      let updatedAnnot = await this.annot.clone().fetch();
      await updateTermProperties(updatedAnnot);

      this.$eventBus.$emit('editAnnotation', updatedAnnot);
      this.$store.commit(this.imageModule + 'changeAnnotSelectedFeature', {indexFeature: 0, annot: updatedAnnot});
    },

    updateProperties() {
      this.$store.dispatch(this.imageModule + 'refreshProperties', this.index);
    },

    handleDeletion() {
      this.$store.commit(this.imageModule + 'addAction', {annot: this.annot, type: Action.DELETE});
      this.$eventBus.$emit('deleteAnnotation', this.annot);
    },

    dragStop(x, y) {
      this.positionAnnotDetails = {x, y};
    },

    async handleResize() {
      await this.$nextTick(); // wait for update of clientWidth and clientHeight to their new values

      if(this.$refs.playground) {
        let maxX = Math.max(this.$refs.playground.clientWidth - this.width, 0);
        let maxY = Math.max(this.$refs.playground.clientHeight - this.$refs.detailsPanel.height, 0);
        let x = Math.min(this.positionAnnotDetails.x, maxX);
        let y = Math.min(this.positionAnnotDetails.y, maxY);
        this.positionAnnotDetails = {x, y};

        // HACK to force the component to recreate and take into account new (x,y) ; should no longer be
        // necessary with version 2 of vue-draggable-resizable
        this.reload = false;
        this.$nextTick(() => this.reload = true);
      }
    }
  },
  created() {
    this.fetchUsers();
    this.fetchUserJobs();
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.$eventBus.$on('updateMapSize', this.handleResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
    this.$eventBus.$off('updateMapSize', this.handleResize);
  }
};
</script>

<style scoped>
.annotation-details-playground {
  position: absolute;
  left: 3.5rem;
  top: 3.5rem;
  right: 4.5rem;
  bottom: 2em;
  pointer-events: none; /* to allow selection of elements below it */
  /* background: rgba(255, 255, 255, 0.2);
  border: 2px dashed rgba(0, 0, 0, 0.5); */
}

.draggable {
  background: #f2f2f2;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  pointer-events: auto;
}

.actions {
  padding: 0.35em;
  text-align: right;
  background-color: #e5e5e5;
  border-bottom: 1px solid #b5b5b5;
  border-radius: 5px 5px 0 0;
  display: flex;
  align-items: center;
}

h1 {
  font-size: 0.9rem;
  padding: 0;
  flex: 1;
  text-align: left;
  margin-left: 0.4em;
}

.actions .button {
  margin-left: 0.25rem;
  width: 1.75rem;
}

.annotation-details-container {
  padding: 0.6em;
  overflow: auto;
  height: 100%;
}
</style>

<style>
.dragging .button.drag {
  background-color: #6899d0;
  color: #fff;
}

.annotation-details-playground .draggable {
  z-index: 15 !important;
}
</style>
