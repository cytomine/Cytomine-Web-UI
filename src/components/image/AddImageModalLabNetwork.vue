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
              <strong>{{$t('image')}}</strong>
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
              <strong>{{$t('hv-staining-protocol')}}</strong>
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
          <div class="columns" v-if="canManageProject">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-laboratory')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedLab"
                :options="laboratories"
                :close-on-select="true"
                label="value" track-by="id"
              />
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-staining')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedStaining"
                :options="stainings"
                :close-on-select="true"
                label="value" track-by="id"
              />
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-antibody')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedAntibody"
                :options="antibodies"
                :close-on-select="true"
                label="value" track-by="id"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-dilution')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedDilution"
                :options="dilutions"
                :close-on-select="true"
                label="value" track-by="id"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-detection')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedDetection"
                :options="detections"
                :close-on-select="true"
                label="value" track-by="id"
              />

            </div>
          </div>
          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('hv-instrument')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedInstrument"
                :options="instruments"
                :close-on-select="true"
                label="value" track-by="id"
              />

            </div>
          </div>


          <div class="columns">
            <div class="column is-one-quarter has-text-right">
              <strong>{{$t('tags')}}</strong>
            </div>
            <div class="column is-half">
              <cytomine-multiselect
                v-model="selectedTags"
                :multiple="true"
                :options="tags"
                label="name" track-by="id"
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

      </div>
    </div>
  </template>
  <template #footer>
    <button class="button" type="button" @click="$emit('update:active', false)">
      {{$t('button-cancel')}}
    </button>
    <button class="button is-success" @click="startUpload(imageToUpload)" :disabled="!uploadable || success">
      {{$t('start-upload')}}
    </button>
  </template>
</cytomine-modal>
</template>

<script>
import constants from '@/utils/constants.js';
import {get} from '@/utils/store-helpers';
import {Cytomine, AbstractImage, AttachedFile, Configuration, Description, ImageInstance, HVMetadataCollection, StorageAccessCollection, TagCollection, TagDomainAssociation, UploadedFile} from 'cytomine-client';
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
      selectedLab: null,
      stainings: [],
      selectedStaining: null,
      antibodies: [],
      selectedAntibody: null,
      dilutions: [],
      selectedDilution: null,
      detections: [],
      selectedDetection: null,
      instruments: [],
      selectedInstrument: null,
      tags: [],
      selectedTags: [],
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
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
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
      console.log('uploadable');
      /*console.log('this.selectedStorage');
      console.log(this.selectedStorage != null);
      console.log('this.selectedImage');
      console.log(this.selectedImage != null);
      console.log('this.selectedProtocol');
      console.log(this.selectedProtocol != null);
      console.log('this.selectedLab');
      console.log(this.selectedLab != null);
      console.log('this.selectedStaining');
      console.log(this.selectedStaining != null);
      console.log('this.selectedAntibody');
      console.log(this.selectedAntibody != null);
      console.log('this.selectedDilution');
      console.log(this.selectedDilution != null);
      console.log('this.selectedDetection');
      console.log(this.selectedDetection != null);
      console.log('this.selectedInstrument');
      console.log(this.selectedInstrument != null);
      console.log('uploadable2');*/
      return this.selectedStorage != null && this.selectedImage != null;/*  && this.selectedProtocol != null&&
        this.selectedLab != null &&
        this.selectedStaining != null &&
        this.selectedAntibody != null &&
        this.selectedDilution != null &&
        this.selectedDetection != null &&
        this.selectedInstrument != null;*/

    }
  },
  watch: {
    active(val) {
      if(val) {
        this.selectedStorage = null;
        this.descriptionContent = '';
        this.selectedProtocol = null;
        this.selectedImage = null;
        this.imageToUpload = null;
        this.name = null;
        this.ongoingUpload = false;
        this.selectedLab = null;
        this.selectedStaining = null;
        this.selectedAntibody = null;
        this.selectedDilution = null;
        this.selectedDetection = null;
        this.selectedInstrument = null;
        this.processing = false;
        this.success = false;
        this.failed = false;
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

        await this.rename();
        await this.associateMetadata();
        await this.addToProject();
      }).catch(error => {
        this.processing = false;
        if(!axios.isCancel(error)) {
          console.log(error);
          fileWrapper.uploadedFile = false;
          this.failed = true;
          this.errorMessage = error;
        }
      }).finally(() => fileWrapper.uploading = false);
    },

    async rename(){
      try {

        if(this.name && this.imageToUpload.abstractImage.originalFilename){
          this.imageToUpload.abstractImage.originalFilename = this.name;
          this.imageToUpload.abstractImage = await this.imageToUpload.abstractImage.save();
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-image-rename')});
        this.failed = true;
        this.errorMessage = this.$t('notif-error-image-rename');
      }
    },

    async associateMetadata(){
      try {

        if(this.selectedLab) this.imageToUpload.abstractImage.laboratory = this.selectedLab.id;
        if(this.selectedStaining) this.imageToUpload.abstractImage.staining = this.selectedStaining.id;
        if(this.selectedAntibody) this.imageToUpload.abstractImage.antibody = this.selectedAntibody.id;
        if(this.selectedDilution) this.imageToUpload.abstractImage.dilution = this.selectedDilution.id;
        if(this.selectedDetection) this.imageToUpload.abstractImage.detection = this.selectedDetection.id;
        if(this.selectedInstrument) this.imageToUpload.abstractImage.instrument = this.selectedInstrument.id;

        if(this.selectedLab || this.selectedStaining || this.selectedAntibody ||
          this.selectedDilution || this.selectedDetection || this.selectedInstrument) this.imageToUpload.abstractImage = await this.imageToUpload.abstractImage.save();

        let associationPromises = [];
        for(let i = 0; i < this.selectedTags.length; i++) {
          associationPromises.push(new TagDomainAssociation({tag : this.selectedTags[i].id}, this.imageToUpload.abstractImage).save());
        }
        await Promise.all(associationPromises);
        /*let newAssocations = await Promise.all(associationPromises).then(function(values) {
          return values;
        });
        this.associatedTags = this.associatedTags.concat(newAssocations);
        this.sortAssociatedTags();
        this.$notify({type: 'success', text: this.$t('notif-success-add-tag-domain-association')});*/

      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-save-prop')});
        this.failed = true;
        this.errorMessage = this.$t('notif-error-save-prop');
      }


      //attached file -- protocol
      if(this.selectedProtocol) {
        try {
          await new AttachedFile({file: this.selectedProtocol, key: constants.ATTACHED_FILE_HV_STAINING_PROTOCOL, filename: this.selectedProtocol.name}, this.imageToUpload.abstractImage).save();
        }
        catch(error) {
          console.log(error);
          this.$notify({type: 'error', text: this.$t('notif-error-attached-file-creation')});
          this.failed = true;
          this.errorMessage = this.$t('notif-error-attached-file-creation');
        }
      }

      //description
      if(this.descriptionContent){
        try {
          await new Description({data: this.descriptionContent, object: this.imageToUpload.abstractImage}).save();
        }
        catch(error) {
          console.log(error);
          this.$notify({type: 'error', text: this.$t('notif-error-update-description')});
          this.failed = true;
          this.errorMessage = this.$t('notif-error-update-description');
        }
      }
    },
    async addToProject(){
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
        this.success = true;
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
    async fetchTags() {
      try {
        this.tags = (await TagCollection.fetchAll()).array.sort((a, b) => a.name.localeCompare(b.name));
      }
      catch(error) {
        console.log(error);
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
    this.laboratories = await this.loadMetadata('laboratory');
    this.fetchStorages();
    this.stainings = await this.loadMetadata('staining');
    this.antibodies = await this.loadMetadata('antibody');
    this.dilutions = await this.loadMetadata('dilution');
    this.detections = await this.loadMetadata('detection');
    this.instruments = await this.loadMetadata('instrument');
    this.fetchTags();
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
