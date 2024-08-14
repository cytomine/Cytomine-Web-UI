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
<!--          <li>{{$t('max-size-upload-info')}}</li>-->
          <li>
            {{$t('allowed-formats-upload-info')}}
            <template v-if="formatInfos.length">
            <span v-for="(format, index) in formatInfos" :key="format.id">
              {{format.name}}<v-popover v-if="format.remarks">
                <i class="fas fa-info-circle"></i>
                <template #popover>
                  <p>{{format.remarks}}</p>
                </template>
              </v-popover><template v-if="index < formatInfos.length - 1">, </template>
            </span>
            </template>
          </li>
          <li>{{$t('drag-drop-upload-info', {labelButton: $t('add-files')})}}</li>
          <li>{{$t('link-to-project-upload-info')}}</li>

        </ul>
      </b-message>

      <div class="columns">
        <div class="column is-one-quarter has-text-right">
          <strong>{{$t('storage')}}</strong>
        </div>
        <div class="column is-half">
          <cytomine-multiselect v-model="selectedStorage" :options="storages" label="extendedName" track-by="id" :allow-empty="false">
            <template #option="{option}">
              {{option.extendedName}}
              <template v-if="currentUser.isDeveloper">
                 ({{$t('id')}}: {{option.id}})
              </template>
            </template>
          </cytomine-multiselect>
        </div>
      </div>

      <div class="columns">
        <div class="column is-one-quarter has-text-right">
          <strong>{{$t('link-with-project')}}</strong>
        </div>
        <div class="column is-half">
          <cytomine-multiselect
            v-model="selectedProjects"
            :options="projects"
            label="name"
            track-by="id"
            :multiple="true"
            :close-on-select="true"
          />
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
      <div class="search-block">
        <b-input
          :value="searchString"
          @input="debounceSearchString"
          class="search-uploaded-file"
          :placeholder="$t('search-placeholder')"
          icon="search"
          type="search"
        />

        <button class="button" @click="filtersOpened = !filtersOpened">
          <span class="icon">
            <i class="fas fa-filter"></i>
          </span>
          <span>
            {{filtersOpened ? $t('button-hide-filters') : $t('button-show-filters')}}
          </span>
        </button>
      </div>

      <b-collapse :open="filtersOpened">
        <div class="filters">
          <div class="columns">
            <div class="column is-one-third">
              <div class="filter-label">{{ $t('vendor') }}</div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedVendors"
                  :multiple="true"
                  :options="availableVendors"
                  label="label"
                  track-by="value"
                />
              </div>

              <div class="filter-label">{{ $t('format') }}</div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedFormats"
                  :multiple="true"
                  :options="availableFormats"
                />
              </div>
            </div>

            <div class="column is-one-third">
              <div class="filter-label">{{ $t('magnification') }}</div>
              <div class="filter-body">
                <cytomine-multiselect
                  v-model="selectedMagnifications"
                  :options="availableMagnifications"
                  :multiple="true"
                  :searchable="false"
                  label="label"
                  track-by="value"
                />
              </div>
            </div>

            <div class="column is-one-third">
              <div class="filter-label">{{ $t('height') }}</div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsHeight" :max="maxHeight" />
              </div>

              <div class="filter-label">{{ $t('width') }}</div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsWidth" :max="maxWidth" />
              </div>
            </div>
          </div>

          <div class="columns is-multiline">
            <div class="column is-half" v-for="format in selectedFormats" :key="format">
              <metadata-filter
                :format="format"
                :image-ids="aiIDs[format]"
                :keys="metadataKeys[format]"
                :max="metadataMax"
                :type="metadataType"
              />
            </div>
          </div>
        </div>

        <div class="buttons button-add is-right">
          <button class="button is-link" @click="createProject()">
            {{ $t('new-project-with-filtered-images') }}
          </button>
        </div>
      </b-collapse>

      <cytomine-table
        :collection="uploadedFileCollection"
        sort="created" order="desc"
        :revision="revision"
        :refreshInterval="tableRefreshInterval"
        :openedDetailed.sync="openedDetails"
      >
        <template #default="{row: uFile}">
          <b-table-column :label="$t('preview')" width="80" class="image-overview">
            <image-thumbnail v-if="uFile.thumbURL" :url="uFile.thumbURL" :size="128" :key="uFile.thumbURL" :extra-parameters="{Authorization: 'Bearer ' + shortTermToken }"/>
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

<!--          <b-table-column field="globalSize" :label="$t('global-size')" sortable width="80">-->
<!--            {{ filesize(uFile.globalSize) }}-->
<!--          </b-table-column>-->

          <b-table-column field="status" :label="$t('status')" sortable width="80">
            <uploaded-file-status :file="uFile" />
          </b-table-column>

          <!--<b-table-column field="parentFilename" :label="$t('from-file')" sortable width="150">-->
            <!--{{ uFile.parentFilename ? uFile.parentFilename : "-" }}-->
          <!--</b-table-column>-->

          <b-table-column label="" centered width="80">
            <div class="columns is-vcentered">
              <div class="column is-two-thirds">
                <b-select
                  v-model="selectedProjectsToLink[uFile.image]"
                  :placeholder="projectPlaceholders[uFile.image] ? $t('select-project') : $t('no-project')"
                  :disabled="!projectPlaceholders[uFile.image]"
                  expanded
                >
                  <option v-for="project in filteredProjects[uFile.image]" :key="project.id" :value="project">
                    {{ project.name }}
                  </option>
                </b-select>
              </div>

              <div class="column is-one-quarter">
                <button
                  class="button is-small is-link"
                  :disabled="!projectPlaceholders[uFile.image]"
                  @click="addImage(uFile)"
                >
                  {{ $t('add-image') }}
                </button>
              </div>
            </div>
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

  <add-project-modal :active.sync="createModal" :ontologies="ontologies" />
</div>
</template>

<script>
import {stripIDfromKey} from '@/utils/metadata.js';
import {get} from '@/utils/store-helpers';
import {isNumeric} from '@/utils/string-utils';

import {
  AbstractImage,
  AbstractImageCollection,
  Cytomine,
  ImageInstance,
  StorageCollection,
  OntologyCollection,
  ProjectCollection,
  PropertyCollection,
  UploadedFileCollection,
  UploadedFile,
  UploadedFileStatus
} from 'cytomine-client';
import axios from 'axios';
import filesize from 'filesize';
import _ from 'lodash';
import constants from '@/utils/constants.js';

import UploadedFileStatusComponent from './UploadedFileStatus';
import UploadedFileDetails from './UploadedFileDetails';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import CytomineTable from '@/components/utils/CytomineTable';
import ImageThumbnail from '@/components/image/ImageThumbnail';
import AddProjectModal from '@/components/project/AddProjectModal';
import MetadataFilter from '@/components/search/MetadataFilter.vue';
import vendorFromFormat from '@/utils/vendor';

export default {
  name: 'cytomine-storage',
  components: {
    AddProjectModal,
    ImageThumbnail,
    CytomineMultiselect,
    CytomineSlider,
    'uploaded-file-status': UploadedFileStatusComponent,
    UploadedFileDetails,
    CytomineTable,
    MetadataFilter,
  },
  data() {
    return {
      loading: true,
      newUploadError: false,
      timeoutRefreshSessionUploads: null,
      tableRefreshInterval: constants.STORAGE_REFRESH_INTERVAL,

      abstractImages: [],
      availableFormats: [],
      availableMagnifications: [],
      availableVendors: [],
      boundsHeight: [],
      boundsWidth: [],
      createModal: false,
      filteredImageIDs: {},
      filtersOpened: false,
      filteredProjects: {},
      maxHeight: 100,
      maxWidth: 100,
      metadataKeys: {},
      metadataMax: {},
      metadataType: {},
      ontologies: [],
      projectPlaceholders: {},
      properties: {},
      selectedFormats: [],
      selectedMagnifications: [],
      selectedProjectsToLink: {},
      selectedVendors: [],

      storages: [],
      selectedStorage: null,
      projects: [],
      selectedProjects: [],
      formatInfos: [],

      searchString: '',
      openedDetails: [],

      dropFiles: [],

      signature: '',
      signatureDate: '',

      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    shortTermToken: get('currentUser/shortTermToken'),
    aiIDs() {
      let ids = {};
      this.availableFormats.forEach(format => ids[format] = []);
      this.abstractImages.forEach(ai => ids[ai.contentType].push(ai.id));

      return ids;
    },
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
      if(this.selectedProjects) {
        str += `&idProject=${this.selectedProjects.map(project => project.id).join(',')}`;
      }
      return str;
    },
    plainFiles() {
      return this.dropFiles.map(wrapper => wrapper.file);
    },

    multiSelectFilters() {
      return [
        { prop: 'contentType', selected: this.selectedFormats, total: this.availableFormats.length },
        { prop: 'magnification', selected: this.selectedMagnifications.map(option => option.value), total: this.availableMagnifications.length },
        { prop: 'vendor', selected: this.selectedVendors.map(option => option.value), total: this.availableVendors.length },
      ];
    },

    boundsFilters() {
      return [
        { prop: 'height', bounds: this.boundsHeight },
        { prop: 'width', bounds: this.boundsWidth },
      ];
    },

    uploadedFileCollection() {
      let collection = new UploadedFileCollection({
        onlyRootsWithDetails: true,
        withTreeDetails: false,
        originalFilename: {ilike: encodeURIComponent(this.searchString)}
      });

      for (let { prop, bounds } of this.boundsFilters) {
        collection[prop] = {
          lte: bounds[1]
        };

        if(bounds[0] > 0) {
          collection[prop]['gte'] = bounds[0];
        }
      }

      for (let { prop, selected, total } of this.multiSelectFilters) {
        if (prop === 'vendor') {
          prop = 'mimeType';
        }

        if (selected.length > 0 && selected.length < total) {
          collection[prop] = {
            in: selected.join()
          };
        }
      }

      let filteredIDs = [];
      this.selectedFormats.forEach(format => {
        filteredIDs = filteredIDs.concat(this.filteredImageIDs[format]);
      });
      if (filteredIDs.length > 0) {
        collection['include'] = {
          in: filteredIDs.join(',')
        };
      }

      return collection;
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
    async addAbstractImage(uFile) {
      let ai = (await Cytomine.instance.api.get(
        `uploadedfile/${uFile.id}/abstractimage.json`
      )).data;
      ai = await AbstractImage.fetch(ai.id); /* ai not the same object */
      this.$set(this.filteredProjects, ai.id, this.projects);
      this.$set(this.projectPlaceholders, ai.id, true);

      await this.fetchMetadata(ai);

      let oldMaxHeight = this.maxHeight;
      let oldMaxWidth = this.maxWidth;
      this.maxHeight = Math.max(ai.height, this.maxHeight);
      this.maxWidth = Math.max(ai.width, this.maxWidth);
      this.boundsHeight = this.boundsHeight[1] === oldMaxHeight ? [0, this.maxHeight] : this.boundsHeight;
      this.boundsWidth = this.boundsWidth[1] === oldMaxWidth ? [0, this.maxWidth] : this.boundsWidth;

      if (!this.availableFormats.includes(ai.contentType)) {
        this.availableFormats.push(ai.contentType);
        this.$set(this.filteredImageIDs, ai.contentType, []);
      }
      this.abstractImages.push(ai);

      if ((this.availableFormats.length-1) === this.selectedFormats.length) {
        this.selectedFormats.push(ai.contentType);
      }
      if (this.selectedFormats.includes(ai.contentType)) {
        this.filteredImageIDs[ai.contentType].push(ai.id);
      }

      let magnification = this.getMagnification(ai.magnification);
      if (!this.availableMagnifications.includes(magnification)) {
        this.availableMagnifications.push(magnification);
      }
      if ((this.availableMagnifications.length-1) === this.selectedMagnifications.length) {
        this.selectedMagnifications.push(magnification);
      }

      let vendorFormatted = this.getVendor(ai.contentType);
      if (!this.availableVendors.find(vendor => vendor.value === vendorFormatted.value)) {
        this.availableVendors.push(vendorFormatted);
      }
      if ((this.availableVendors.length-1) === this.selectedVendors.length) {
        this.selectedVendors.push(vendorFormatted);
      }
    },
    async addImage(uFile) {
      if (this.selectedProjectsToLink[uFile.image] === undefined) {
        return;
      }

      let project = this.selectedProjectsToLink[uFile.image];
      let propsTranslation = {
        imageName: uFile.originalFilename,
        projectName: project.name
      };

      try {
        await new ImageInstance({
          baseImage: uFile.image,
          project: project.id
        }).save();

        let projects = this.filteredProjects[uFile.image];
        projects.splice(projects.indexOf(project), 1);
        this.$set(this.filteredProjects, uFile.image, projects);
        this.$set(this.projectPlaceholders, uFile.image, projects.length != 0);
        this.$set(this.selectedProjectsToLink, uFile.image, null);

        this.$notify({
          type: 'success',
          text: this.$t('notif-success-add-image', propsTranslation)
        });
      }
      catch (error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-add-image', propsTranslation)
        });
      }
    },
    async createProject() {
      let filteredUFileCollection = (await this.uploadedFileCollection.fetchAll()).array;
      this.$eventBus.$emit('update-ufiles', filteredUFileCollection);
      this.createModal = true;
    },
    async fetchMetadata(ai) {
      let properties = (await PropertyCollection.fetchAll({object: ai})).array;
      properties.sort((a, b) => a.key.localeCompare(b.key));
      this.properties[ai.id] = properties;

      let keys = new Set();
      properties.forEach(property => {
        let key = stripIDfromKey(property.key);
        keys.add(key);
        this.metadataType[key] = isNumeric(property.value) ? Number : String;

        if (!(key in this.metadataMax)) {
          this.metadataMax[key] = property.value;
        }

        if (this.metadataMax[key] < property.value) {
          this.metadataMax[key] = isNumeric(property.value) ? +property.value : property.value;
        }
      });

      this.metadataKeys[ai.contentType].forEach((k) => keys.add(k));
      this.metadataKeys[ai.contentType] = Array.from(keys);
    },
    getMagnification(magnification) {
      return {
        value: magnification || 'null',
        label: magnification || this.$t('unknown')
      };
    },
    getVendor(format) {
      let vendor = vendorFromFormat(format);
      return {
        value: vendor ? format : 'null',
        label: vendor ? vendor.name : this.$t('unknown')
      };
    },
    async fetchAbstractImages() {
      this.abstractImages = (await AbstractImageCollection.fetchAll()).array;
      this.maxHeight = Math.max(...this.abstractImages.map(ai => ai.height), this.maxHeight);
      this.maxWidth = Math.max(...this.abstractImages.map(ai => ai.width), this.maxWidth);
      this.boundsHeight = [0, this.maxHeight];
      this.boundsWidth = [0, this.maxWidth];

      let formats = new Set();
      let magnifications = new Set();

      this.abstractImages.forEach(ai => {
        formats.add(ai.contentType);
        magnifications.add(ai.magnification);
      });

      this.availableFormats = Array.from(formats);
      this.availableMagnifications = Array.from(magnifications).map(m => this.getMagnification(m));

      this.availableFormats.forEach(format => {
        let vendorFormatted = this.getVendor(format);
        if (!this.availableVendors.find(vendor => vendor.value === vendorFormatted.value)) {
          this.availableVendors.push(vendorFormatted);
        }

        this.filteredImageIDs[format] = [];
        this.metadataKeys[format] = [];
      });

      this.selectedFormats = [...this.availableFormats];
      this.selectedMagnifications = [...this.availableMagnifications];
      this.selectedVendors = [...this.availableVendors];

      let aiToImages = {};
      await Promise.all(this.abstractImages.map(async (ai) => {
        await this.fetchMetadata(ai);

        aiToImages[ai.id] = (await Cytomine.instance.api.get(
          `abstractimage/${ai.id}/imageinstance.json`
        )).data.collection;

        this.filteredImageIDs[ai.contentType].push(ai.id);
      }));

      for (const [key, value] of Object.entries(aiToImages)) {
        let toRemove = value.map(image => image.project);
        this.filteredProjects[key] = this.projects.filter(project => {
          return !toRemove.includes(project.id);
        });

        this.projectPlaceholders[key] = this.filteredProjects[key].length !== 0;
      }
    },
    async fetchStorages() {
      try {
        this.storages = (await StorageCollection.fetchAll()).array;
        this.storages.forEach(v => {
          v.extendedName = v.name;
          if(this.currentUser.isDeveloper) v.extendedName +=' '+this.$t('id')+': '+v.id;
        });

        this.selectedStorage = this.storages.find(storage => storage.user === this.currentUser.id);
      }
      catch(error) {
        console.log(error);
        this.newUploadError = true;
      }
    },
    async fetchOntologies() {
      let ontologies = (await OntologyCollection.fetchAll({light: true})).array;
      ontologies.sort((a, b) => a.name.localeCompare(b.name));
      this.ontologies = ontologies;
    },
    async fetchProjects() {
      try {
        this.projects = (await ProjectCollection.fetchAll()).array;
      }
      catch(error) {
        console.log(error); // not mandatory for upload => only log error, no other action
      }
    },
    async fetchFormatInfos() {
      try {
        this.formatInfos = (await Cytomine.instance.api.get('imageserver/format.json')).data.collection;
      }
      catch (error) {
        console.log(error);
      }
    },

    async refreshStatusSessionUploads() {
      let pendingStatus = [
        UploadedFileStatus.UPLOADED,
        UploadedFileStatus.DETECTING_FORMAT,
        UploadedFileStatus.EXTRACTING_DATA,
        UploadedFileStatus.CONVERTING,
        UploadedFileStatus.DEPLOYING,
        50,
        60
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
      return (size) ? filesize(size, {base: 10}) : null;
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
        fileWrapper.uploadedFile = new UploadedFile(response.data[0].uploadedFile);
        this.refreshStatusSessionUploads();
        this.revision++;
        setTimeout(
          this.addAbstractImage,
          constants.STORAGE_REFRESH_INTERVAL,
          fileWrapper.uploadedFile
        );
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
    },

    updatedTree() {
      this.revision++; // updating the table will result in new files objects => the uf details will also be updated
    },

    debounceSearchString: _.debounce(async function(value) {
      this.searchString = value;
    }, 500),

    includeImageIDs(format, imageIDs) {
      this.$delete(this.filteredImageIDs, format);
      this.$set(this.filteredImageIDs, format, imageIDs);
    }
  },
  activated() {
    this.fetchAbstractImages();
    this.fetchStorages();
    this.fetchOntologies();
    this.fetchProjects();
    this.fetchFormatInfos();
    this.refreshStatusSessionUploads();
    this.tableRefreshInterval = constants.STORAGE_REFRESH_INTERVAL;

    this.$eventBus.$on('includeImageIDs', this.includeImageIDs);
  },
  deactivated() {
    clearTimeout(this.timeoutRefreshSessionUploads);
    this.tableRefreshInterval = 0;

    this.$eventBus.$off('includeImageIDs', this.includeImageIDs);
  },
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

.image-overview >>> .image-thumbnail {
  max-height: 4em;
  max-width: 6em;
}

.panel-block.storage {
  min-height: 20vh;
  position: relative;
}

.search-block {
  display: flex;
}

.b-table td, th {
  vertical-align: middle !important;
}

.button-add {
  padding: 1rem;
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
  margin-right: 1rem;
  max-width: 25em;
}
</style>
