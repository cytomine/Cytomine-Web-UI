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
<cytomine-modal :active="active" :title="$t('button-add-image-lab-network')" @close="$emit('update:active', false)">
  <b-loading :is-full-page="false" :active="loading" class="small" />
  <template v-if="!loading">
    <template>

      <div class="columns">
        <div class="column is-half">
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('storage')}}</strong>
            </div>
            <div class="column is-half">
              storage<!--{{selectedStorage.name}}-->
            </div>
          </div>

          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('file')}}</strong>
            </div>
            <div class="column is-three-quarters">
              <b-field>
                <b-upload v-model="selectedImage" type="is-link" drag-drop>
                  <section class="section">
                    <div class="content has-text-centered">
                      <template v-if="!selectedImage">
                        <p><i class="fas fa-upload fa-3x"></i></p>
                        <p>{{$t('choose-file-or-drop')}}</p>
                      </template>
                      <template v-else>
                        <p class="filename is-size-4"><i class="fas fa-file"></i> {{selectedImage.name}}</p>
                        <p class="has-text-grey is-size-6">{{$t('click-or-drop-new-file')}}</p>
                      </template>
                    </div>
                  </section>
                </b-upload>
              </b-field>
            </div>
          </div>

          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('name')}}</strong>
            </div>
            <div class="column is-half">
              <b-field>
                <b-input v-model="name" :disabled="!selectedImage" name="name" v-validate="'required'" />
              </b-field>
            </div>
          </div>

          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('protocol')}}</strong>
            </div>
            <div class="column is-three-quarters">
              <b-field>
                <b-upload v-model="selectedProtocol" type="is-link" drag-drop>
                  <section class="section">
                    <div class="content has-text-centered">
                      <template v-if="!selectedProtocol">
                        <p><i class="fas fa-upload fa-3x"></i></p>
                        <p>{{$t('choose-file-or-drop')}}</p>
                      </template>
                      <template v-else>
                        <p class="filename is-size-4"><i class="fas fa-file"></i> {{selectedProtocol.name}}</p>
                        <p class="has-text-grey is-size-6">{{$t('click-or-drop-new-file')}}</p>
                      </template>
                    </div>
                  </section>
                </b-upload>
              </b-field>
            </div>
          </div>
        </div>







        <div class="column is-half">
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('lab-id')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedLab"
                :options="laboratories"
                label="name"
                track-by="id"
                :close-on-select="true"
              />
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('staining')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedStaining"
                :options="stainings"
                label="name"
                track-by="id"
                :close-on-select="true"
              />
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('antibidy')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedAntibody"
                :options="antibodies"
                label="name"
                track-by="id"
                :close-on-select="true"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('dilution')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedDilution"
                :options="dilutions"
                label="name"
                track-by="id"
                :close-on-select="true"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('detection')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedDetection"
                :options="detections"
                label="name"
                track-by="id"
                :close-on-select="true"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('instrument')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedInstrument"
                :options="instruments"
                label="name"
                track-by="id"
                :close-on-select="true"
              />

            </div>
          </div>




        </div>

      </div>

      <div class="columns">
        <div class="column is-narrow has-text-right" style="width: 12.5%;">
          <strong>{{$t('description')}}</strong>
        </div>
        <div class="column is-10">
          <div class="keyword-info">
            <i class="fas fa-info-circle"></i>
            <i18n path="info-keyword-stop-preview-description">
              <span place="keyword" class="keyword"> {{ stopPreviewKeyword }} </span>
            </i18n>
          </div>
          <cytomine-quill-editor v-model="descriptionContent" :placeholder="$t('enter-description')" />
        </div>
      </div>


      <!--<div class="columns">
        <div class="column is-half flex-column is-offset-one-quarter">
          <progress v-if="ongoingUpload" class="progress is-success" :value="overallProgress" max="100">
            {{overallProgress}}%
          </progress>

          <div class="buttons">
            <b-upload :value="plainFiles" type="is-link" multiple drag-drop @input="filesChange">
              <a class="button is-success">{{$t('add-files')}}</a>
            </b-upload>
            <button class="button is-link" @click="startAll()" :disabled="!filesPendingUpload">
              {{$t('start-upload')}}
            </button>
            <button class="button" @click="cancelAll()" :disabled="!filesPendingUpload && !ongoingUpload">
              {{$t('cancel-upload')}}
            </button>
            <button class="button" @click="hideFinished()" v-if="filesFinishedUpload">
              {{$t('hide-successful-upload')}}
            </button>
          </div>
        </div>
      </div>-->
    </template>
  </template>
</cytomine-modal>
</template>

<script>
import constants from '@/utils/constants.js';
import {get} from '@/utils/store-helpers';
import {ImageInstance} from 'cytomine-client';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import CytomineModal from '@/components/utils/CytomineModal';
import CytomineTable from '@/components/utils/CytomineTable';

export default {
  name: 'add-image-modal-lab-network',
  props: {
    active: Boolean,
  },
  components: {
    CytomineTable,
    CytomineModal,
    CytomineMultiselect,
    CytomineQuillEditor
  },
  data() {
    return {
      loading: true,
      descriptionContent: '',
      selectedProtocol:null,
      selectedImage:null,
      name: null,
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
    };
  },
  computed: {
    project: get('currentProject/project'),
    descriptionWithoutKeywords() {
      return this.description.data.replace(new RegExp(constants.STOP_PREVIEW_KEYWORD, 'g'), '');
    },
    stopPreviewKeyword() {
      return constants.STOP_PREVIEW_KEYWORD;
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.idsAddedImages = [];
      }
    },
    selectedImage(file) {
      if(file) {
        this.name = file.name;
      }
    }
  },
  methods: {
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
