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
<div>
  <h2>
    {{$t('file-tree')}}
  </h2>
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <sl-vue-tree v-else v-model="nodes" :allowMultiselect="false">
    <template #toggle="{node}">
      <template v-if="!node.isLeaf">
        <i :class="['tree-toggle', 'fas', node.isExpanded ? 'fa-angle-down' : 'fa-angle-right']"></i>
      </template>
    </template>

    <template #title="{node}">
      <p :class="{'target-element': node.data.id === file.id}">{{node.title}}</p>
    </template>

    <template #sidebar="{node}">
      <div class="filesize">
        {{filesize(node.data.size)}}
      </div>
      <div class="status">
        <uploaded-file-status :file="node.data" :iconOnly="true" />
      </div>
      <div class="buttons">
        <a class="button is-small is-link" :href="node.data.downloadURL">
          {{$t('button-download')}}
        </a>
        <button class="button is-small is-danger" @click="confirmDeletion(node.data)">
          {{$t('button-delete')}}
        </button>
      </div>
      <p class="preview">
        <a v-if="node.data.thumbURL" @click="samplePreview = node.data">
          {{$t('sample-preview')}}
        </a>
        <span v-if="node.data.thumbURL && node.data.macroURL">/</span>
        <a v-if="node.data.macroURL" @click="slidePreview = node.data">
          {{$t('slide-preview')}}
        </a>
      </p>
    </template>
  </sl-vue-tree>

  <template v-if="nbUploadedFiles > 10">
    <div class="level">
      <b-select v-model="nbPerPage" size="is-small" class="level-left">
        <option value="10">{{$t('count-per-page', {count: 10})}}</option>
        <option value="25">{{$t('count-per-page', {count: 25})}}</option>
        <option value="50">{{$t('count-per-page', {count: 50})}}</option>
        <option value="100">{{$t('count-per-page', {count: 100})}}</option>
      </b-select>

      <b-pagination
        class="level-right"
        :total="nbUploadedFiles"
        :current.sync="currentPage"
        size="is-small"
        :per-page="nbPerPage"
      />
    </div>
  </template>

  <template v-if="samplePreview">
    <h2>
      {{$t('sample-preview-of', {filename: samplePreview.originalFilename})}}
      <button class="button is-small" @click="samplePreview = null">{{$t('button-hide')}}</button>
    </h2>
    <img :src="samplePreview.thumbURL">
  </template>
  <template v-else-if="slidePreview">
    <h2>
      {{$t('slide-preview-of', {filename: slidePreview.originalFilename})}}
      <button class="button is-small" @click="slidePreview = null">{{$t('button-hide')}}</button>
    </h2>
    <img :src="slidePreview.macroURL">
  </template>

  <template v-if="image && profileEnabled">
    <h2>{{$t('companion-files')}}</h2>
    <table class="table">
      <tbody>
      <tr>
        <td class="prop-label">{{$t('profile')}}</td>
        <td class="prop-content">
          <profile-status :image="image" @update="$emit('update')"></profile-status>
        </td>
      </tr>
      </tbody>
    </table>
  </template>

  <h2>{{$t('image-metadata')}}</h2>
  <div class="image-details-wrapper">
    <table class="table">
      <tbody>
        <tr>
          <td class="prop-label">{{$t('hv-staining')}}</td>
          <td class="prop-content">
            <template v-if="image.stainingValue">{{image.stainingValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr v-if="currentUser.adminByNow">
          <td class="prop-label" >{{$t('hv-laboratory')}}</td>
          <td class="prop-content">
            <template v-if="image.laboratoryValue">{{image.laboratoryValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('hv-antibody')}}</td>
          <td class="prop-content">
            <template v-if="image.antibodyValue">{{image.antibodyValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('hv-dilution')}}</td>
          <td class="prop-content">
            <template v-if="image.dilutionValue">{{image.dilutionValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('hv-detection')}}</td>
          <td class="prop-content">
            <template v-if="image.detectionValue">{{image.detectionValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('hv-instrument')}}</td>
          <td class="prop-content">
            <template v-if="image.instrumentValue">{{image.instrumentValue}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('description')}}</td>
          <td class="prop-content">
            <cytomine-description :object="image" :canEdit="canEdit" />
          </td>
        </tr>
        <!--
        <tr>
          <td class="prop-label">{{$t('tags')}}</td>
          <td class="prop-content">
            <cytomine-tags :object="image" :canEdit="canEdit" />
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('properties')}}</td>
          <td class="prop-content">
            <cytomine-properties :object="image" :canEdit="canEdit" />
          </td>
        </tr>
        -->
        <tr>
          <td class="prop-label">{{$t('hv-staining-protocol')}}</td>
          <td class="prop-content" colspan="3">
            <attached-files :object="image" :atkey="attachedFileHVStainingProtocolKey" :canEdit="canEdit" />
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('attached-files')}}</td>
          <td class="prop-content">
            <attached-files :object="image" :canEdit="canEdit" />
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('filename')}}</td>
          <td class="prop-content">
            {{image.originalFilename}}
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('image-size')}}</td>
          <td class="prop-content">
            {{`${image.width} x ${image.height} ${$t('pixels')}`}}
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('resolution')}}</td>
          <td class="prop-content">
            <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t('um-per-pixel')}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('magnification')}}</td>
          <td class="prop-content">
            <template v-if="image.magnification">{{image.magnification}}</template>
            <template v-else>{{$t('unknown')}}</template>
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{$t('actions')}}</td>
          <td class="prop-content">
            <div class="buttons are-small">
              <template v-if="canEdit">
                <button class="button" @click="isRenameModalActive = true">
                  {{$t('button-rename')}}
                </button>
                <button class="button" @click="isCalibrationModalActive = true">
                  {{$t('button-set-calibration')}}
                </button>
                <button class="button" @click="isMagnificationModalActive = true">
                  {{$t('button-set-magnification')}}
                </button>
                <button class="button" @click="isHVMetadataModalActive = true">
                  {{$t('set-metadata')}}
                </button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <rename-modal
      :title="$t('rename-image')"
      :currentName="image.originalFilename"
      :active.sync="isRenameModalActive"
      @rename="rename"
    />

    <magnification-modal
      :image="image"
      :active.sync="isMagnificationModalActive"
      @setMagnification="(magnification) => image.magnification=magnification"
    />

    <calibration-modal
      :image="image"
      :active.sync="isCalibrationModalActive"
      @setResolution="(resolution) => image.resolution=resolution"
    />

    <h-v-metadata-modal
      :image="image"
      :active.sync="isHVMetadataModalActive"
      @setMetadata="(laboratory, staining, antibody, dilution, detection, instrument) => setMetadata(laboratory, staining, antibody, dilution, detection, instrument)"
    />
  </div>

</div>
</template>

<script>
import SlVueTree from 'sl-vue-tree';
import {UploadedFile, UploadedFileCollection, AbstractImage, UploadedFileStatus as UFStatus} from 'cytomine-client';
import UploadedFileStatus from './UploadedFileStatus';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import CytomineTags from '@/components/tag/CytomineTags';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import MagnificationModal from '@/components/image/MagnificationModal';
import CalibrationModal from '@/components/image/CalibrationModal';
import HVMetadataModal from '@/components/image/HVMetadataModal';
import RenameModal from '@/components/utils/RenameModal';
import filesize from 'filesize';
import ProfileStatus from './ProfileStatus';

import {get} from '@/utils/store-helpers';
import constants from '@/utils/constants.js';

export default {
  name: 'uploaded-file-details',
  components: {
    ProfileStatus,
    SlVueTree,
    CytomineDescription,
    CytomineTags,
    CytomineProperties,
    AttachedFiles,
    MagnificationModal,
    CalibrationModal,
    RenameModal,
    HVMetadataModal,
    UploadedFileStatus
  },
  props: {
    file: Object // WARNING: the root of the tree must be the file or its direct parent
  },
  data() {
    return {
      canEdit : true,
      rootId: null,
      uploadedFiles: [],
      nodes: [],
      image: null,
      slidePreview: null,
      samplePreview: null,
      error: false,

      nbUploadedFiles: 0,
      currentPage: 1,
      nbPerPage: 10,

      profileEnabled: false,
      isRenameModalActive: false,
      isCalibrationModalActive: false,
      isMagnificationModalActive: false,
      isHVMetadataModalActive: false,
      attachedFileHVStainingProtocolKey: constants.ATTACHED_FILE_HV_STAINING_PROTOCOL
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    collection() {
      return new UploadedFileCollection({
        root: this.rootId,
        max: this.nbPerPage
      });
    },
  },
  watch: {
    async file() {
      this.findRoot();
      await Promise.all([this.fetchAbstractImage(), this.makeTree()]);
    },
    async currentPage() {
      this.findRoot();
      await this.makeTree();
    },
    async collection() {
      await this.makeTree();
    },
    slidePreview(val) {
      if(val) {
        this.samplePreview = null; // if slide preview enabled, disable sample preview
      }
    },
    samplePreview(val) {
      if(val) {
        this.slidePreview = null; // if sample preview enabled, disable slide preview
      }
    },
  },
  methods: {
    findRoot() {
      this.rootId = this.file.root || this.file.id;
    },
    async fetchAbstractImage() {
      if (this.file.image && (this.file.status === UFStatus.CONVERTED || this.file.status === UFStatus.DEPLOYED)) {
        try {
          this.image = await AbstractImage.fetch(this.file.image);
        }
        catch(error) {
          console.log(error);
          this.error = true;
        }
      }
    },
    async makeTree() {
      try {
        let data = (await this.collection.fetchPage(this.currentPage - 1));
        this.uploadedFiles = data.array;
        this.nbUploadedFiles = data.totalNbItems;
        this.nodes = (await this.createNodes(null));
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
    async createNodes(idParent) {
      let directChildren = this.uploadedFiles.filter(file => file.parent === idParent);

      if (directChildren.length === 0 && idParent === null) {
        let missingIds = this.uploadedFiles[0].lTree.split('.');
        await Promise.all(missingIds.slice(0, missingIds.length - 1).map(async id => {
          this.uploadedFiles.unshift((await UploadedFile.fetch(id)));
        }));
        return this.createNodes(null);
      }

      return await Promise.all(directChildren.map(async file => {
        let children = await this.createNodes(file.id);
        return {
          title: file.originalFilename,
          isLeaf: children.length === 0,
          isDraggable: false,
          isExpanded: true,
          data: {downloadURL: file.downloadURL, ...file}, // data converted to object by sl-vue-tree => need to define downloadURL as property
          children
        };
      }));
    },
    filesize(size) {
      return filesize(size, {base: 10});
    },
    confirmDeletion(file) {
      this.$buefy.dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-file'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteFile(file)
      });
    },
    async deleteFile(file) {
      try {
        await UploadedFile.delete(file.id);
        this.$emit('update');
      }
      catch(error) {
        console.log(error);
        let errorValues = error.response.data.errorValues;
        let text;
        if(errorValues && errorValues.projectNames && errorValues.imageNames) {
          text = this.$t('notif-error-delete-used-uploaded-file', {
            projects: errorValues.projectNames.join(', '),
            names: errorValues.imageNames.join(', ')
          });
        }
        else {
          text = this.$t('notif-error-delete-uploaded-file');
        }
        this.$notify({type: 'error', text});
      }
    },
    async rename(newName) {
      let oldName = this.image.originalFilename;
      try {
        this.image.originalFilename = newName;
        await this.image.save();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-image-rename', {imageName: this.image.originalFilename})
        });
        this.$emit('update');
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-image-rename', {imageName: oldName})
        });
      }
      this.isRenameModalActive = false;
    },
    async setMetadata(laboratory, staining, antibody, dilution, detection, instrument) {
      [laboratory,staining,antibody,dilution,detection,instrument].forEach( metadata => {
        this.image[metadata]=metadata;
        this.image[metadata+'Value']= metadata ? metadata.value : null;
      });
    }

  },
  async created() {
    this.findRoot();
    this.image = new AbstractImage({id: this.file.image, class: 'be.cytomine.image.AbstractImage'});
    this.fetchAbstractImage();
    /*this.makeTree();
    this.abstractImage = new AbstractImage({id: this.file.image, class: 'be.cytomine.image.AbstractImage'});
    this.abstractImage = await (this.abstractImage.fetch());*/
  }
};
</script>

<style scoped>
.target-element {
  font-weight: 600;
  min-width: 0; /* to allow correct handling of overflow-wrap */
}

.filesize {
  width: 8em;
  margin-left: 1em;
}

.status {
  width: 5em;
}

.preview {
  width: 20em;
}

.buttons {
  margin-right: 2em;
  margin-bottom: 0 !important;
}

.buttons .button {
  margin-bottom: 0.5em !important;
  margin-top: 0.2em !important;
}

h2:not(:first-child) {
  margin-top: 1em;
  /*border-bottom: 2px solid #ddd;*/
}

h2 .button {
  position: relative;
  bottom: 3px;
  margin-left: 0.8em;
  text-transform: none;
}

>>> .sl-vue-tree-sidebar {
  display: flex;
  align-items: top;
  justify-content: flex-end;
}

>>> .sl-vue-tree-gap {
  border: 0 dotted #bbb;
  border-left-width: 1px;
  position: relative;
  right: 0.95em;
  bottom: 1.25em;
}

>>> .sl-vue-tree-toggle {
  background: #fafafa;
  z-index: 1;
}

>>> .sl-vue-tree-gap:nth-last-child(3) {
  border-width: 0 0 1px 1px !important;
}

>>> ul.pagination-list {
  justify-content: flex-end;
}

.level {
  padding-bottom: 0.5rem !important;
}

.table {
  /*background: none;*/
  position: relative;
  height: 3em;
}

td.prop-label {
  white-space: nowrap;
  font-weight: 600;
}

td.prop-content {
  width: 100%;
}
</style>
