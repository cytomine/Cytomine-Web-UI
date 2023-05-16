<!-- Copyright (c) 2009-2020. Authors: see NOTICE file.

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
  <form @submit.prevent="copy()">
    <cytomine-modal 
      :title="title"
      :active="active"
      @close="close()"
    >
      <h2>{{ $t('destination-project') }} : </h2>
      
      <b-field>
        <b-select 
          v-model="selectedProject"
          :placeholder="$t('project')"
          name="project"
          size="is-small"
        >
          <option 
            v-for="project in projectsWithoutOriginalProject"
            :value="project.id"
            :key="project.id"
          >
            {{ project.name }}
          </option>
        </b-select>
      </b-field>

      <br />
      
      <h2>Options : </h2>
      
      <div class="columns">
        <div class="column">
          <b-checkbox v-model="copyMetadata">
            {{ $t('copy-metadata') }}
          </b-checkbox>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <b-checkbox v-model="copyAnnot">
            {{ $t('copy-annotations') }} ({{ currentImage.numberOfAnnotations }}).
          </b-checkbox>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <b-checkbox
            v-if="copyAnnot"
            v-model="copyAnnotMetadata"
            style="align-items: start;"
          >
            <div>
              {{ $t('copy-annotations-metadata') }}
            </div>
            <div>
              <b-icon pack="fas" icon="exclamation-circle" size="is-small"></b-icon>
              {{ $t('copy-annotations-metadata-important-note') }}
            </div>
          </b-checkbox>
        </div>
      </div>

      <div v-if="selectedProject && selectedProject != currentImage.project && copyAnnot">
        <br />
        <h2>{{ $t('annotation-layers-to-copy') }} : </h2>

        <div class="columns">
          <div class="column is-half">
            <b-checkbox v-model="selectUnselectAllChoice">
              {{ $t('select-unselect-layers') }}
            </b-checkbox>
          </div>
        </div>

        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th></th>
              <th>{{ $t('source-annotation-layer') }}</th>
              <th>{{ $t('destination-annotation-layer') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="layer in annotationLayersTransfert"
              :value="layer.source"
              :key="layer.source"
            >
              <td>
                <b-checkbox v-model="selectedLayers[layer.source]">
                </b-checkbox>
              </td>
              <td>{{ layer.label }}</td>
              <td>
                <b-field>
                  <b-select
                    v-model="layer.destination"
                    :disabled="!selectedLayers[layer.source]"
                    :placeholder="$t('select-layer')"
                    name="project"
                    size="is-small"
                  >
                    <option 
                      v-for="layer in destinationAnnotationLayers"
                      :value="layer.id"
                      :key="layer.id"
                    >
                      {{ fullName(layer) }}
                    </option>
                  </b-select>
                </b-field>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>

        <button 
          @click="close()"
          class="button"
          type="button"
        >
          {{ $t('button-cancel') }}
        </button>
        
        <button
          :disabled="(!selectedProject || selectedProject == currentImage.project)"
          class="button is-link"
        >
          {{ $t('button-copy') }}
        </button>

      </template>
    </cytomine-modal>
  </form>
</template>
  
<script>
import CytomineModal from '@/components/utils/CytomineModal';
import { Project, ProjectCollection } from 'cytomine-client';
import { get } from '@/utils/store-helpers';
import { fullName } from '@/utils/user-utils.js';

export default {
  name: 'copy-modal',
  extends: CytomineModal,
  props: {
    title: String,
    currentImage: null
  },
  components: { CytomineModal },
  data() {
    return {
      copyMetadata: true,
      copyAnnot: true,
      copyAnnotMetadata: true,
      selectedProject: null,
      projects: [],
      destinationAnnotationLayers: [],
      sourceAnnotationLayers: [],
      indexLayers: [],
      selectUnselectAllChoice: false,
      selectedLayers: {},
      disabled: false
    };
  },
  methods: {
    isLayerSelected(layer) {
      return this.selectedLayers[layer.source] && layer.destination != null;
    },
    copy() {
      this.$emit(
        'copy',
        this.selectedProject,
        this.copyMetadata,
        this.copyAnnot,
        this.copyAnnotMetadata,
        this.annotationLayersTransfert.filter(this.isLayerSelected)
      );
    },
    async fetchLayers() {
      this.sourceAnnotationLayers = (await this.project.fetchUserLayers(this.currentImage.id)).array;
    },
    async fetchDestinationLayers() {
      this.destinationAnnotationLayers = (await (new Project({ id: this.selectedProject })).fetchUserLayers()).array.sort((a, b) => (a.lastname < b.lastname) ? -1 : 1);
    },
    async fetchIndexLayers() {
      this.indexLayers = await this.currentImage.fetchAnnotationsIndex();
    },
    fullName(layer) {
      return fullName(layer);
    },
    selectAll() {
      Object.keys(this.selectedLayers).forEach(v => this.selectedLayers[v] = true);
    },
    unselectAll() {
      Object.keys(this.selectedLayers).forEach(v => this.selectedLayers[v] = false);
    }
  },
  computed: {
    project: get('currentProject/project'),
    projectsWithoutOriginalProject() {
      return this.projects.filter(project => project.id !== this.project.id)
    },
    annotationLayersTransfert() {
      this.sourceAnnotationLayers; // to force listening.

      let mergedLayers = this.indexLayers.map(t1 => ({ ...t1, ...this.sourceAnnotationLayers.find(t2 => t2.id === t1.user) }));
      mergedLayers.forEach(v => this.$set(this.selectedLayers, v.id, false));
      return mergedLayers.sort((a, b) => (a.lastname < b.lastname) ? -1 : 1).map(layer => ({ source: layer.id, label: `${fullName(layer)} (${layer.countAnnotation || 0})`, destination: null }));
    }
  },
  watch: {
    selectedProject() {
      if (this.selectedProject == null) this.destinationAnnotationLayers = [];
      else {
        this.fetchDestinationLayers();
      }
    },
    selectUnselectAllChoice(value) {
      if (value) {
        this.selectAll();
      } else {
        this.unselectAll();
      }
    }
  },
  async created() {
    this.projects = (await ProjectCollection.fetchAll()).array.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1);
    this.fetchIndexLayers();
    this.fetchLayers();
  }
};
</script>
  