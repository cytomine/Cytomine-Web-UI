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
    <template v-if="!processing">

      <div class="columns">
        <div class="column is-half">
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('storage')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect v-model="selectedStorage" :options="storages" label="name" track-by="id" :allow-empty="false" />
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
    </template>
    <b-loading v-else :is-full-page="false" :active="processing && !success && !failed" class="small" />

    <article v-if="success" class="message is-success">
      <section class="message-body">
        <div class="media">
          <div class="media-content">
            This image {{name}} has been successfully uploaded to the project.
          </div>
        </div>
      </section>
    </article>

    <article v-if="failed" class="message is-danger">
      <section class="message-body">
        <div class="media">
          <div class="media-content">
            An error occured.
          </div>
        </div>
      </section>
    </article>

    <div class="columns" v-if="!success && !failed">
      <div class="column is-half flex-column is-offset-one-quarter">
        <progress v-if="ongoingUpload" class="progress is-success" :value="imageToUpload.progress" max="100">
          {{imageToUpload.progress}}%
        </progress>

        <div class="buttons">
          <button class="button is-success" @click="startUpload(imageToUpload)" :disabled="!uploadable">
            {{$t('start-upload')}}
          </button>
          <button class="button" @click="cancelAll()" :disabled="!ongoingUpload">
            {{$t('cancel-upload')}}
          </button>
        </div>
      </div>
    </div>
  </template>
</cytomine-modal>
</template>

<script>
import constants from '@/utils/constants.js';
import {get} from '@/utils/store-helpers';
import {Cytomine, AbstractImage, AttachedFile, Configuration, Description, ImageInstance, Property, StorageAccessCollection, UploadedFile/*, UploadedFileStatus*/} from 'cytomine-client';
import axios from 'axios';
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
      storages:[],
      selectedStorage:null,
      descriptionContent: '',
      selectedProtocol:null,
      selectedImage:null,
      imageToUpload:null,
      name: null,
      ongoingUpload:false,
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
      signature: '',
      signatureDate: '',
      processing: false,
      success : false,
      failed : false,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    descriptionWithoutKeywords() {
      return this.description.data.replace(new RegExp(constants.STOP_PREVIEW_KEYWORD, 'g'), '');
    },
    stopPreviewKeyword() {
      return constants.STOP_PREVIEW_KEYWORD;
    },
    uri() {
      return '/upload';
    },
    queryString() {
      let str = `cytomine=${constants.CYTOMINE_CORE_HOST}`;
      if(this.selectedStorage) {
        str += `&idStorage=${this.selectedStorage.id}`;
      }
      str += '&sync=true';
      return str;
    },
    uploadable(){
      /*console.log('uploadable');
      console.log('this.selectedStorage');
      console.log(this.selectedStorage != null);
      console.log('this.selectedImage');
      console.log(this.selectedImage != null);
      console.log('this.selectedProtocol');
      console.log(this.selectedProtocol != null);
      console.log('this.selectedLab');
      console.log(this.selectedLab && this.selectedLab.length > 0);
      console.log('this.selectedStaining');
      console.log(this.selectedStaining && this.selectedStaining.length > 0);
      console.log('this.selectedAntibody');
      console.log(this.selectedAntibody && this.selectedAntibody.length > 0);
      console.log('this.selectedDilution');
      console.log(this.selectedDilution && this.selectedDilution.length > 0);
      console.log('this.selectedDetection');
      console.log(this.selectedDetection && this.selectedDetection.length > 0);
      console.log('this.selectedInstrument');
      console.log(this.selectedInstrument && this.selectedInstrument.length > 0);
      console.log('uploadable2');*/
      return this.selectedStorage != null && this.selectedImage != null && this.selectedProtocol != null &&
        this.selectedLab && this.selectedLab.length > 0 &&
        this.selectedStaining && this.selectedStaining.length > 0 &&
        this.selectedAntibody && this.selectedAntibody.length > 0 &&
        this.selectedDilution && this.selectedDilution.length > 0 &&
        this.selectedDetection && this.selectedDetection.length > 0 &&
        this.selectedInstrument && this.selectedInstrument.length > 0;

    }
  },
  watch: {
    active(val) {
      if(val) {
        this.idsAddedImages = [];
      }
    },
    async queryString() {
      this.generateSignature();
    },
    selectedImage(file) {
      if(file) {
        this.name = file.name;
        this.imageToUpload = {
          file,
          uploading: false,
          progress: 0,
          uploadedFile: null, // null if upload not finished, false if upload failed, UploadedFile instance if upload successful
          abstractImage: null, // null if upload not finished, false if upload failed, AbstractImage instance if upload successful
          cancelToken: null
        };
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
    },
    async loadConfigByPrefix(configKey) {
      let configurationValue;
      try {
        configurationValue = (await new Configuration({key: configKey}).fetch()).value;
        return configurationValue.split(',').filter(s => s.length > 0);
      }
      catch(error) {
        if(error.response.status == 404) {
          //404 if configuration not set. Ignore.
          configurationValue = '';
          return [];
        }
        else {
          console.log(error);
          this.error = true;
        }
      }
    },
    async startUpload(fileWrapper) {
      if(fileWrapper.uploading || fileWrapper.uploadedFile !== null) {
        return;
      }

      let formData = new FormData();
      formData.append('files[]', fileWrapper.file);
      fileWrapper.cancelToken = axios.CancelToken.source();
      fileWrapper.uploading = true;
      this.ongoingUpload = true;
      this.processing = true;
      axios.post(
        constants.CYTOMINE_UPLOAD_HOST + this.uri + '?' + this.queryString,
        formData,
        {
          headers: {
            'authorization': `CYTOMINE ${this.currentUser.publicKey}:${this.signature}`,
            'dateFull': this.signatureDate, // will replace actual date value, so that signature is valid
            'content-type-full': 'null' // will erase actual content-type value, so that signature is valid
          },
          onUploadProgress: progress => {
            fileWrapper.progress = Math.floor((progress.loaded * 100) / progress.total);
          },
          cancelToken: fileWrapper.cancelToken.token
        }
      ).then(async response => {
        fileWrapper.uploadedFile = new UploadedFile(response.data[0].uploadedFile);
        fileWrapper.abstractImage = new AbstractImage(response.data[0].images[0].image);

        await this.associateMetadata();
        await this.addToProject();
      }).catch(error => {
        this.processing = false;
        if(!axios.isCancel(error)) {
          console.log(error);
          fileWrapper.uploadedFile = false;
        }
      }).finally(() => fileWrapper.uploading = false);
    },

    async associateMetadata(){
      try {

        await Promise.all([
          //lab_id
          new Property({key: 'hv-laboratory', value: this.selectedLab}, this.imageToUpload.abstractImage).save(),
          //staining
          new Property({key: 'hv-staining', value: this.selectedStaining}, this.imageToUpload.abstractImage).save(),
          //antibody
          new Property({key: 'hv-antibody', value: this.selectedAntibody}, this.imageToUpload.abstractImage).save(),
          //detection
          new Property({key: 'hv-detection', value: this.selectedDilution}, this.imageToUpload.abstractImage).save(),
          //dilution
          new Property({key: 'hv-dilution', value: this.selectedDetection}, this.imageToUpload.abstractImage).save(),
          //instrument
          new Property({key: 'hv-instrument', value: this.selectedInstrument}, this.imageToUpload.abstractImage).save()
        ]);

        //await prop.save();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-save-prop')});
      }


      //attached file -- protocol
      try {
        await new AttachedFile({file: this.selectedProtocol, filename: this.selectedProtocol.name}, this.imageToUpload.abstractImage).save();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-attached-file-creation')});
      }

      //description
      try {
        await new Description({data: this.descriptionContent, object: this.imageToUpload.abstractImage}).save();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-update-description')});
      }
    },
    async addToProject(){
      console.log('coucou. Ici ajoute l abstrat image au project');
      let propsTranslation = {imageName: this.imageToUpload.abstractImage.originalFilename, projectName: this.project.name};
      try {
        let image = await new ImageInstance({baseImage: this.imageToUpload.abstractImage.id, project: this.project.id}).save();
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
    async fetchStorages() {
      try {
        this.storages = (await StorageAccessCollection.fetchAll()).array.filter(storage => storage.permission == 'ADMINISTRATION' || storage.permission == 'WRITE');
        //this.selectedStorage = this.storages.find(storage => storage.user === this.currentUser.id);
      }
      catch(error) {
        console.log(error);
        this.newUploadError = true;
      }
    },
    async generateSignature() {
      this.signatureDate = new Date().toISOString();
      try {
        this.signature = await Cytomine.instance.fetchSignature({
          uri: this.uri,
          queryString: this.queryString,
          method: 'POST',
          date: this.signatureDate
        });
      }
      catch(error) {
        this.newUploadError = true;
      }
    },
  },
  async created() {
    this.loading = false;
    this.laboratories = await this.loadConfigByPrefix('hv-laboratory-list');
    this.fetchStorages();
    this.stainings = await this.loadConfigByPrefix('hv-staining-list');
    this.antibodies = await this.loadConfigByPrefix('hv-antibody-list');
    this.dilutions = await this.loadConfigByPrefix('hv-detection-list');
    this.detections = await this.loadConfigByPrefix('hv-dilution-list');
    this.instruments = await this.loadConfigByPrefix('hv-instrument-list');
    this.generateSignature();
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
