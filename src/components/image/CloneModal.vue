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
<form @submit.prevent="clone()">
  <cytomine-modal :title="title" :active="active" @close="close()">

    <h2>{{$t('project')}} : </h2>
    <b-field>
      <b-select
        size="is-small"
        v-model="selectedProject"
        :placeholder="$t('select-project')"
        name="project"
      >
        <option v-for="project in projectsWithoutOriginalProject" :value="project.id" :key="project.id">
          {{project.name}}
        </option>
      </b-select>
    </b-field>

    <br/>
    <h2>Options : </h2>
    <div class="columns">
      <div class="column">
        <b-checkbox v-model="cloneMetadata">
          {{$t('clone-metadata')}}
        </b-checkbox>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half">
        <b-checkbox v-model="cloneAnnot">
          {{$t('clone-annotations')}} ({{currentImage.numberOfAnnotations}})
        </b-checkbox>
      </div>
      <div class="column is-half">
        <b-checkbox v-model="cloneAnnotMetadata" v-if="cloneAnnot">
          {{$t('clone-annotations-metadata')}}
        </b-checkbox>
      </div>
    </div>

    <div v-if="selectedProject && selectedProject != currentImage.project && cloneAnnot">
      <br/>
      <h2>{{$t('annotation-layers')}} : </h2>

      <div class="columns">
        <div class="column is-half">
          <b-checkbox v-model="selectUnselectAllChoice">
            {{$t('select-unselect-layers')}}
          </b-checkbox>
        </div>
      </div>

      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th></th>
            <th>{{$t('name')}}</th>
            <th>{{$t('destination')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="layer in annotationLayersTransfert" :value="layer.source" :key="layer.source">
            <td>
              <b-checkbox v-model="selectedLayers[layer.source]">
              </b-checkbox>
            </td>
            <td>{{layer.label}}</td>
            <td>
              <b-field>
                <b-select :disabled="!selectedLayers[layer.source]"
                  size="is-small"
                  v-model="layer.destination"
                  :placeholder="$t('select-layer')"
                  name="project"
                >
                  <option v-for="layer in destinationAnnotationLayers" :value="layer.id" :key="layer.id">
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
      <button class="button" type="button" @click="close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="(!selectedProject || selectedProject == currentImage.project)">
        {{$t('button-clone')}}
      </button>
    </template>
  </cytomine-modal>
</form>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';
import {Project, ProjectCollection} from 'cytomine-client';
import {get} from '@/utils/store-helpers';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'clone-modal',
  extends: CytomineModal,
  props: {
    title: String,
    currentImage: null
  },
  components: {CytomineModal},
  data() {
    return {
      cloneMetadata:true,
      cloneAnnot:true,
      cloneAnnotMetadata:true,
      selectedProject : null,
      projects: null,
      destinationAnnotationLayers:[],
      sourceAnnotationLayers:[],
      indexLayers: [],
      selectUnselectAllChoice: false,
      selectedLayers: {},
      disabled: false
    };
  },
  methods: {
    isLayerSelected(layer) {
      return this.selectedLayers[layer.source] && layer.destination!=null;
    },
    clone() {
      this.$emit('clone', this.selectedProject, this.cloneMetadata, this.cloneAnnot, this.cloneAnnotMetadata, this.annotationLayersTransfert.filter(this.isLayerSelected));
    },
    async fetchLayers() {
      this.sourceAnnotationLayers = (await this.project.fetchUserLayers(this.currentImage.id)).array;
    },
    async fetchDestinationLayers() {
      this.destinationAnnotationLayers = (await (new Project({id: this.selectedProject})).fetchUserLayers()).array.sort((a, b) => (a.lastname < b.lastname) ? -1 : 1 );
    },
    async fetchIndexLayers() {
      console.log(this.currentImage.id);
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
  computed : {
    project: get('currentProject/project'),
    projectsWithoutOriginalProject() {
      return this.projects.filter(x => x.id !== this.project.id)
    },
    annotationLayersTransfert(){
      this.sourceAnnotationLayers; // to force listening.

      let mergedLayers = this.indexLayers.map(t1 => ({...t1, ...this.sourceAnnotationLayers.find(t2 => t2.id === t1.user)}));
      mergedLayers.forEach(v => this.$set(this.selectedLayers, v.id, false));
      return mergedLayers.sort((a, b) => (a.lastname < b.lastname) ? -1 : 1 ).map(layer => ({source : layer.id, label :`${fullName(layer)} (${layer.countAnnotation || 0})`, destination:null} ));
    }
  },
  watch :{
    selectedProject(){
      if(this.selectedProject == null) this.destinationAnnotationLayers = [];
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
    this.projects = (await ProjectCollection.fetchAll()).array.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1 );
    this.fetchIndexLayers();
    this.fetchLayers();
  }
};
</script>
