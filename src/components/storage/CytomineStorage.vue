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
<div class="storage-wrapper content-wrapper">
  <div class="panel">
    <p class="panel-heading">
      {{ $t('upload') }}
    </p>
    <div class="panel-block" v-if="newUploadError">
      <b-message type="is-danger" has-icon icon-size="is-small">
        {{ $t('error-cannot-upload') }}
      </b-message>
    </div>
    <div class="panel-block" v-else>
      <b-message type="is-info" has-icon icon-size="is-small">
        <h2>{{$t('important-notes')}}</h2>
        <ul class="small-text">
          <li>{{$t('allowed-formats-upload-info')}}</li>
          <li>{{$t('vms-mrxs-upload-info')}}</li>
          <li>{{$t('zip-upload-info')}}</li>
          <li>{{$t('drag-drop-upload-info', {labelButton: $t('add-files')})}}</li>
          <li>{{$t('link-to-project-upload-info')}}</li>
        </ul>
      </b-message>

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
          <strong>{{$t('link-with-project')}}</strong>
        </div>
        <div class="column is-half">
          <cytomine-multiselect v-model="selectedProject" :options="projects" label="name" track-by="id" />
        </div>
      </div>

      <div class="columns">
        <div class="column is-one-quarter has-text-right">
          <strong>{{$t('files')}}</strong>
        </div>
        <div class="column is-half">
          <table v-if="dropFiles.length > 0" class="table is-fullwidth upload-table">
            <tbody>
              <tr v-for="(wrapper, idx) in dropFiles" :key="idx">
                <td>{{wrapper.file.name}}</td>
                <td>{{filesize(wrapper.file.size)}}</td>
                <template v-if="wrapper.uploadedFile === null">
                  <td>
                    <progress class="progress is-info" :value="wrapper.progress" max="100">
                      {{wrapper.progress}}%
                    </progress>
                  </td>
                  <td>
                    <div class="field is-grouped">
                      <p class="control">
                        <button class="button is-link" @click="startUpload(wrapper)">
                          {{$t('button-start')}}
                        </button>
                      </p>
                      <p class="control">
                        <button class="button" @click="cancelUpload(idx)">
                          {{$t('button-cancel')}}
                        </button>
                      </p>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td>
                    <uploaded-file-status v-if="wrapper.uploadedFile" :file="wrapper.uploadedFile" />
                    <span v-else class="tag is-danger">
                      {{$t('upload-error')}}
                    </span>
                  </td>
                  <td>
                    <p class="control">
                      <button class="button" @click="cancelUpload(idx)">{{$t('button-hide')}}</button>
                    </p>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
          <em v-else class="first-child-like has-text-grey">{{$t('no-file')}}</em>
        </div>
      </div>

      <div class="columns">
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
      </div>

    </div>
  </div>

  <div class="panel">
    <p class="panel-heading">
      {{ $t('storage') }}
    </p>
    <div class="panel-block storage">
      <b-input
        :value="searchString"
        @input="debounceSearchString"
        class="search-uploaded-file"
        :placeholder="$t('search-placeholder')"
        icon="search"
      />

      <cytomine-table
        :collection="uploadedFileCollection"
        sort="created" order="desc"
        :revision="revision"
        :openedDetailed.sync="openedDetails"
        :refreshInterval="tableRefreshInterval"
      >
        <template #default="{row: uFile}">
          <b-table-column :label="$t('preview')" width="80">
            <img v-if="uFile.thumbURL" :src="uFile.thumbURL" alt="-" class="image-overview">
            <div v-else class="is-size-7 has-text-grey">{{$t('no-preview-available')}}</div>
          </b-table-column>

          <b-table-column field="originalFilename" :label="$t('filename')" sortable width="200">
            {{ uFile.originalFilename }}
          </b-table-column>

          <b-table-column field="created" :label="$t('created')" sortable width="150">
            {{ Number(uFile.created) | moment('lll') }}
          </b-table-column>

          <b-table-column field="size" :label="$t('size')" sortable width="80">
            {{ filesize(uFile.size) }}
          </b-table-column>

          <b-table-column field="contentType" :label="$t('content-type')" sortable width="100">
            {{ uFile.contentType }}
          </b-table-column>

          <b-table-column field="globalSize" :label="$t('global-size')" sortable width="80">
            {{ filesize(uFile.globalSize) }}
          </b-table-column>

          <b-table-column field="status" :label="$t('status')" sortable width="80">
            <uploaded-file-status :file="uFile" />
          </b-table-column>

          <b-table-column field="parentFilename" :label="$t('from')" sortable width="150">
            {{ uFile.parentFilename ? uFile.parentFilename : "-" }}
          </b-table-column>
        </template>

        <template #detail="{row: uFile}">
          <uploaded-file-details :file="uFile" :key="uFile.id" @update="updatedTree()" />
        </template>

        <template #empty>
          <p>{{$t('no-uploaded-file')}}</p>
        </template>
      </cytomine-table>
    </div>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {Cytomine, StorageCollection, ProjectCollection, UploadedFileCollection, UploadedFile, UploadedFileStatus} from 'cytomine-client';
import axios from 'axios';
import filesize from 'filesize';
import _ from 'lodash';
import constants from '@/utils/constants.js';

import UploadedFileStatusComponent from './UploadedFileStatus';
import UploadedFileDetails from './UploadedFileDetails';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineTable from '@/components/utils/CytomineTable';

export default {
  name: 'cytomine-storage',
  components: {
    CytomineMultiselect,
    'uploaded-file-status': UploadedFileStatusComponent,
    UploadedFileDetails,
    CytomineTable
  },
  data() {
    return {
      loading: true,
      newUploadError: false,
      timeoutRefreshSessionUploads: null,
      tableRefreshInterval: constants.STORAGE_REFRESH_INTERVAL,

      storages: [],
      selectedStorage: null,
      projects: [],
      selectedProject: null,

      searchString: '',

      dropFiles: [],

      signature: '',
      signatureDate: '',

      openedDetails: [],
      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    finishedStatus() {
      return [
        UploadedFileStatus.CONVERTED,
        UploadedFileStatus.DEPLOYED
      ];
    },
    ongoingUpload() {
      return this.dropFiles.some(wrapper => wrapper.uploading);
    },
    filesPendingUpload() {
      return this.dropFiles.some(wrapper => !wrapper.uploading && wrapper.uploadedFile === null);
    },
    filesFinishedUpload() {
      return this.dropFiles.some(wrapper => !wrapper.uploading && wrapper.uploadedFile !== null
        && this.finishedStatus.includes(wrapper.uploadedFile.status));
    },
    overallProgress() {
      let nbUploads = 0;
      let totalProgress = 0;
      this.dropFiles.forEach(wrapper => {
        if(wrapper.uploading) {
          nbUploads++;
          totalProgress += wrapper.progress;
        }
      });
      return Math.floor(totalProgress / nbUploads);
    },
    uri() {
      return '/upload';
    },
    queryString() {
      let str = `cytomine=${constants.CYTOMINE_CORE_HOST}`;
      if(this.selectedStorage) {
        str += `&idStorage=${this.selectedStorage.id}`;
      }
      if(this.selectedProject) {
        str += `&idProject=${this.selectedProject.id}`;
      }
      return str;
    },
    plainFiles() {
      return this.dropFiles.map(wrapper => wrapper.file);
    },
    uploadedFileCollection() {
      return new UploadedFileCollection({
        detailed: true,
        originalFilename: {ilike: encodeURIComponent(this.searchString)}
      });
    }
  },
  watch: {
    async queryString() {
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
    }
  },
  methods: {
    async fetchStorages() {
      try {
        this.storages = (await StorageCollection.fetchAll()).array;
        this.selectedStorage = this.storages.find(storage => storage.user === this.currentUser.id);
      }
      catch(error) {
        console.log(error);
        this.newUploadError = true;
      }
    },
    async fetchProjects() {
      try {
        this.projects = (await ProjectCollection.fetchAll()).array;
      }
      catch(error) {
        console.log(error); // not mandatory for upload => only log error, no other action
      }
    },

    async refreshStatusSessionUploads() {
      let pendingStatus = [
        UploadedFileStatus.UPLOADED,
        UploadedFileStatus.TO_DEPLOY,
        UploadedFileStatus.UNCOMPRESSED,
        UploadedFileStatus.TO_CONVERT
      ];

      let unfinishedConversions = false;
      let statusChange = false;

      try {
        await Promise.all(this.dropFiles.map(async wrapper => {
          if(wrapper.uploadedFile) {
            let oldStatus = wrapper.uploadedFile.status;
            if(!pendingStatus.includes(oldStatus)) {
              return;
            }

            await wrapper.uploadedFile.fetch();
            let status = wrapper.uploadedFile.status;
            if(status !== oldStatus) {
              statusChange = true;
            }
            if(pendingStatus.includes(status)) {
              unfinishedConversions = true;
            }
          }
        }));
      }
      catch(error) {
        console.log(error);
        return;
      }

      if(statusChange) {
        this.revision++;
      }

      if(unfinishedConversions) {
        clearTimeout(this.timeoutRefreshSessionUploads);
        this.timeoutRefreshSessionUploads = setTimeout(this.refreshStatusSessionUploads, constants.ONGOING_UPLOAD_REFRESH_INTERVAL);
      }
    },

    filesChange(files) {
      files.forEach(file => {
        if(!file.processed) {
          file.processed = true;
          this.dropFiles.push({
            file,
            uploading: false,
            progress: 0,
            uploadedFile: null, // null if upload not finished, false if upload failed, UploadedFile instance if upload successful
            cancelToken: null
          });
        }
      });
    },
    filesize(size) {
      return filesize(size, {base: 10});
    },

    startUpload(fileWrapper) {
      if(fileWrapper.uploading || fileWrapper.uploadedFile !== null) {
        return;
      }

      let formData = new FormData();
      formData.append('files[]', fileWrapper.file);
      fileWrapper.cancelToken = axios.CancelToken.source();
      fileWrapper.uploading = true;
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
      ).then(response => {
        fileWrapper.uploadedFile = new UploadedFile(response.data[0].uploadFile.attr);
        this.refreshStatusSessionUploads();
        this.revision++;
      }).catch(error => {
        if(!axios.isCancel(error)) {
          console.log(error);
          fileWrapper.uploadedFile = false;
        }
      }).finally(() => fileWrapper.uploading = false);
    },
    startAll() {
      this.dropFiles.forEach(wrapper => this.startUpload(wrapper));
    },

    cancelUpload(index) {
      let fileWrapper = this.dropFiles[index];
      if(fileWrapper.cancelToken) {
        fileWrapper.cancelToken.cancel();
      }
      this.dropFiles.splice(index, 1);
    },
    cancelAll() {
      let nbFiles = this.dropFiles.length;
      let idx = 0;
      for(let i = 0; i < nbFiles; i++) {
        if(this.dropFiles[idx].uploadedFile !== null) {
          idx++;
        }
        else {
          this.cancelUpload(idx);
        }
      }
    },
    updatedTree() {
      this.revision++; // updating the table will result in new files objects => the uf details will also be updated
    },
    debounceSearchString: _.debounce(async function(value) {
      this.searchString = value;
    }, 500),
    hideFinished() {
      let nbFiles = this.dropFiles.length;
      let idx = 0;
      for(let i = 0; i < nbFiles; i++) {
        let uploadedFile = this.dropFiles[idx].uploadedFile;
        if (uploadedFile !== null && this.finishedStatus.includes(uploadedFile.status)) {
          this.cancelUpload(idx);
        }
        else {
          idx++;
        }
      }
    }
  },
  activated() {
    this.fetchStorages();
    this.fetchProjects();
    this.refreshStatusSessionUploads();
    this.tableRefreshInterval = constants.STORAGE_REFRESH_INTERVAL;
  },
  deactivated() {
    clearTimeout(this.timeoutRefreshSessionUploads);
    this.tableRefreshInterval = 0;
  }
};
</script>

<style scoped>
.small-text {
  font-size: 0.9em;
}

.upload-table  {
  position: relative;
  bottom: 0.4em;
}

.upload-table td {
  vertical-align: middle !important;
}

.upload-table td:first-child {
  width: 20vw;
}

.upload-table td:nth-child(2) {
  width: 10em;
}

.upload-table td:nth-child(3) {
  width: 15vw;
}

.upload-table td:last-child .field {
  justify-content: flex-end;
}

.upload-table td:last-child .control {
  text-align: right;
}

.column.flex-column {
  flex-direction: column;
}

.progress:not(:last-child) {
  margin-bottom: 0.75em;
}

.column:first-child {
  padding-top: 1.25em;
}

.first-child-like {
  display: block;
  padding-top: 0.5em;
}

.image-overview {
  max-height: 4em;
  max-width: 6em;
}

.panel-block.storage {
  min-height: 20vh;
  position: relative;
}
</style>

<style>
.storage-wrapper .upload-draggable .button {
  margin-bottom: 0;
}

.storage-wrapper .upload-draggable {
  margin-right: 0.75em;
  position: relative;
  bottom: 4px;
}

.search-uploaded-file {
  max-width: 25em;
}
</style>
