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
        <a class="button is-small is-link" @click="download(node.data)">
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
        <span v-if="node.data.thumbURL">/</span>
        <a v-if="node.data.image" @click="imageExplore = node.data">
          {{$t('image-explore')}}
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
    <image-thumbnail :url="samplePreview.thumbURL" :size="512" :key="samplePreview.thumbURL" :extra-parameters="{Authorization: 'Bearer ' + shortTermToken }" />
  </template>
  <template v-else-if="slidePreview">
    <h2>
      {{$t('slide-preview-of', {filename: slidePreview.originalFilename})}}
      <button class="button is-small" @click="slidePreview = null">{{$t('button-hide')}}</button>
    </h2>
    <image-thumbnail :url="slidePreview.macroURL" :size="512" :key="slidePreview.macroURL" :macro="true" :extra-parameters="{Authorization: 'Bearer ' + shortTermToken }"/>
  </template>
  <template v-else-if="imageExplore">
    <h2>
      {{$t('image-explore-of', {filename: imageExplore.originalFilename})}}
      <button class="button is-small" @click="imageExplore = null">{{$t('button-hide')}}</button>
    </h2>
    <uploaded-file-details-viewer :image="image"></uploaded-file-details-viewer>
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
      <tr v-if="isPropDisplayed('overview')">
        <td class="prop-label">{{$t('overview')}}</td>
        <td class="prop-content" colspan="3">
          <router-link :to="`/project/${image.project}/image/${image.id}`">
            <image-thumbnail :image="image" :size="256" :key="`${image.id}-thumb-256`" :extra-parameters="{Authorization: 'Bearer ' + shortTermToken }"/>
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('status')">
        <td class="prop-label">{{$t('status')}}</td>
        <td class="prop-content" colspan="3">
          <image-status :image="image" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfAnnotations')">
        <td class="prop-label">{{$t('user-annotations')}}</td>
        <td class="prop-content" colspan="3">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=user`">
            {{ image.numberOfAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfJobAnnotations')">
        <td class="prop-label">{{$t('analysis-annotations')}}</td>
        <td class="prop-content" colspan="3">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
            {{ image.numberOfJobAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
        <td class="prop-label">{{$t('reviewed-annotations')}}</td>
        <td class="prop-content" colspan="3">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
            {{ image.numberOfReviewedAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('description')">
        <td class="prop-label">{{$t('description')}}</td>
        <td class="prop-content" colspan="3">
          <cytomine-description :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('tags')">
        <td class="prop-label">{{$t('tags')}}</td>
        <td class="prop-content" colspan="3">
          <cytomine-tags :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('properties')">
        <td class="prop-label">{{$t('properties')}}</td>
        <td class="prop-content" colspan="3">
          <cytomine-properties 
            :object="image"
            :error="loadPropertiesError"
            :canEdit="canEdit"
            :properties="metadataFilteredProperties"
            @deleted="removeProp"
            @added="addProp"
          />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('attached-files')">
        <td class="prop-label">{{$t('attached-files')}}</td>
        <td class="prop-content" colspan="3">
          <attached-files :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('original-filename')">
        <td class="prop-label">{{$t('originalFilename')}}</td>
        <td class="prop-content" colspan="3">
          {{image.originalFilename}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('format')">
        <td class="prop-label">{{$t('format')}}</td>
        <td class="prop-content format" colspan="3">
          {{image.contentType}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('vendor')">
        <td class="prop-label">{{$t('vendor')}}</td>
        <td class="prop-content" colspan="3">
          <img v-if="vendor" :src="vendor.imgPath" :alt="vendor.name" :title="vendor.name" class="vendor-img">
          <template v-else>{{$t('unknown')}}</template>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('width') || isPropDisplayed('physicalSizeX')">
        <template v-if="isPropDisplayed('width')">
          <td class="prop-label">{{$t("image-width")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('physicalSizeX') ? 1 : 3">
            {{image.width}} {{$t("pixels")}}
            <template v-if="image.physicalSizeX">({{(image.width * image.physicalSizeX).toFixed(3)}} {{$t("um")}})</template>
          </td>
        </template>
        <template v-if="isPropDisplayed('physicalSizeX')">
          <td class="prop-label">{{$t("x-resolution")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('width') ? 1 : 3">
            <template v-if="image.physicalSizeX">{{image.physicalSizeX.toFixed(3)}} {{$t("um-per-pixel")}}</template>
            <template v-else>{{$t("unknown")}}</template>
          </td>
        </template>
      </tr>
      <tr v-if="isPropDisplayed('height') || isPropDisplayed('physicalSizeY')">
        <template v-if="isPropDisplayed('height')">
          <td class="prop-label">{{$t("image-height")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('physicalSizeY') ? 1 : 3">
            {{image.height}} {{$t("pixels")}}
            <template v-if="image.physicalSizeY">({{(image.height * image.physicalSizeY).toFixed(3)}} {{$t("um")}})</template>
          </td>
        </template>
        <template v-if="isPropDisplayed('physicalSizeY')">
          <td class="prop-label">{{$t("y-resolution")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('height') ? 1 : 3">
            <template v-if="image.physicalSizeY">{{image.physicalSizeY.toFixed(3)}} {{$t("um-per-pixel")}}</template>
            <template v-else>{{$t("unknown")}}</template>
          </td>
        </template>
      </tr>
      <tr v-if="isPropDisplayed('depth') || isPropDisplayed('physicalSizeZ')">
        <template v-if="isPropDisplayed('depth')">
          <td class="prop-label">{{$t("image-depth")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('physicalSizeZ') ? 1 : 3">
            {{$tc("count-slices", image.depth, {count: image.depth})}}
            <template v-if="image.physicalSizeZ">({{(image.depth * image.physicalSizeZ).toFixed(3)}} {{$t("um")}})</template>
          </td>
        </template>
        <template v-if="isPropDisplayed('physicalSizeZ')">
          <td class="prop-label">{{$t("z-resolution")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('depth') ? 1 : 3">
            <template v-if="image.physicalSizeZ">{{image.physicalSizeZ.toFixed(3)}} {{$t("um-per-slice")}}</template>
            <template v-else-if="image.depth < 2">-</template>
            <template v-else>{{$t("unknown")}}</template>
          </td>
        </template>
      </tr>
      <tr v-if="isPropDisplayed('time') || isPropDisplayed('fps')">
        <template v-if="isPropDisplayed('time')">
          <td class="prop-label">{{$t("image-time")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('fps') ? 1 : 3">
            {{$tc("count-frames", image.duration, {count: image.duration})}}
            <template v-if="image.fps && image.duration > 0">
              ({{formatMinutesSeconds(image.duration / image.fps)}})
            </template>
          </td>
        </template>
        <template v-if="isPropDisplayed('fps')">
          <td class="prop-label">{{$t("frame-rate")}}</td>
          <td class="prop-content-half" :colspan="isPropDisplayed('time') ? 1 : 3">
            <template v-if="image.fps">{{image.fps.toFixed(3)}} {{$t("frame-per-second")}}</template>
            <template v-else-if="image.time < 2">-</template>
            <template v-else>{{$t("unknown")}}</template>
          </td>
        </template>
      </tr>
      <tr v-if="isPropDisplayed('channels')">
        <td class="prop-label">{{$t("image-channels")}}</td>
        <td class="prop-content" colspan="3">
          {{image.channels}} x {{image.samplePerPixel}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('size')">
        <td class="prop-label">{{$t('image-size')}}</td>
        <td class="prop-content" colspan="3">
          {{`${image.width} x ${image.height} ${$t('pixels')}`}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('magnification')">
        <td class="prop-label">{{$t('magnification')}}</td>
        <td class="prop-content" colspan="3">
          <template v-if="image.magnification">{{image.magnification}}</template>
          <template v-else>{{$t('unknown')}}</template>
        </td>
      </tr>
      <tr>
        <td class="prop-label">{{$t('actions')}}</td>
        <td class="prop-content" colspan="3">
          <div class="buttons are-small">
            <button v-if="isPropDisplayed('metadata')" class="button" @click="isMetadataModalActive = true">
              {{$t('button-metadata')}}
            </button>

            <template v-if="canEdit">
              <button class="button" @click="isRenameModalActive = true">
                {{$t('button-rename')}}
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

    <image-metadata-modal
      :active.sync="isMetadataModalActive"
      :image="image"
      :properties="onlyMetadataProperties"
      :error="loadPropertiesError"
    />

    <!--
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
    -->
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
import RenameModal from '@/components/utils/RenameModal';
import ImageMetadataModal from '../../components/image/ImageMetadataModal.vue';
import ImageStatus from '../image/ImageStatus.vue';
import UploadedFileDetailsViewer from '@/components/storage/UploadedFileDetailsViewer';
import filesize from 'filesize';
import {appendShortTermToken} from '@/utils/token-utils.js';
import {get} from '@/utils/store-helpers.js';
import ImageThumbnail from '@/components/image/ImageThumbnail';
import vendorFromFormat from '@/utils/vendor';
import {PropertyCollection} from 'cytomine-client';
import constants from '@/utils/constants.js';

export default {
  name: 'uploaded-file-details',
  components: {
    ImageThumbnail,
    SlVueTree,
    CytomineDescription,
    CytomineTags,
    CytomineProperties,
    AttachedFiles,
    MagnificationModal,
    CalibrationModal,
    RenameModal,
    ImageMetadataModal,
    UploadedFileStatus,
    UploadedFileDetailsViewer,
    vendorFromFormat,
    ImageStatus
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
      abstractImage: null,
      slidePreview: null,
      samplePreview: null,
      imageExplore: null,
      error: false,

      nbUploadedFiles: 0,
      currentPage: 1,
      nbPerPage: 10,

      profileEnabled: false,
      isRenameModalActive: false,
      isCalibrationModalActive: false,
      isMagnificationModalActive: false,
      isMetadataModalActive: false,
      properties: [], // Properties of the abstractImage
      loadPropertiesError: false
    };
  },
  computed: {
    shortTermToken: get('currentUser/shortTermToken'),
    collection() {
      return new UploadedFileCollection({
        root: this.rootId,
        max: this.nbPerPage
      });
    },
    vendor() {
      return vendorFromFormat(this.image.contentType);
    },
    internalUseFilteredProperties() {
      return this.properties.filter(prop => !prop.key.startsWith(constants.PREFIX_HIDDEN_PROPERTY_KEY));
    },
    metadataFilteredProperties() {
      let props = this.internalUseFilteredProperties.filter(prop => {
        for (const key in constants.METADATA_PREFIXES) {
          if (prop.key.startsWith(constants.METADATA_PREFIXES[key])) {
            return false;
          }
        }
        return true;
      });
      return props
    },
    onlyMetadataProperties() {
      let props = this.internalUseFilteredProperties.filter(prop => {
        for (const key in constants.METADATA_PREFIXES) {
          if (prop.key.startsWith(constants.METADATA_PREFIXES[key])) {
            return true;
          }
        }
        return false;
      });
      // We sort the properties to improve ease of use in the metadata modal
      return props.sort((a, b) => a.key.localeCompare(b.key));
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
        this.imageExplore = null; // and image explore
      }
    },
    samplePreview(val) {
      if(val) {
        this.slidePreview = null; // if sample preview enabled, disable slide preview
        this.imageExplore = null; // and image explore
      }
    },
    imageExplore(val) {
      if (val) {
        this.slidePreview = null;
        this.samplePreview = null;
      }
    }
  },
  methods: {
    appendShortTermToken,
    isPropDisplayed(prop) {
      return true; // the current implementation is not able to hide data as we are outside of the project view
    },
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
        if(error.response.status===403) {
          text = this.$t('notif-error-delete-uploaded-file-forbidden');
        }
        else if(errorValues && errorValues.projectNames && errorValues.imageNames) {
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
        this.image.originalFilename = oldName;
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-image-rename', {imageName: oldName})
        });
      }
      this.isRenameModalActive = false;
    },
    removeProp(prop) {
      this.properties = this.properties.filter(p => p.id !== prop.id);
    },
    addProp(prop) {
      this.properties.push(prop);
    }
  },
  async created() {
    this.findRoot();
    this.fetchAbstractImage();
    this.image = new AbstractImage({id: this.file.image, class: 'be.cytomine.domain.image.AbstractImage'});
    try {
      this.properties = (await PropertyCollection.fetchAll({ object: this.image })).array;
    }
    catch (error) {
      this.loadPropertiesError = true;
      console.log(error);
    }
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

::v-deep .sl-vue-tree-sidebar {
  display: flex;
  align-items: top;
  justify-content: flex-end;
}

::v-deep .sl-vue-tree-gap {
  border: 0 dotted #bbb;
  border-left-width: 1px;
  position: relative;
  right: 0.95em;
  bottom: 1.25em;
}

::v-deep .sl-vue-tree-toggle {
  background: #fafafa;
  z-index: 1;
}

::v-deep .sl-vue-tree-gap:nth-last-child(3) {
  border-width: 0 0 1px 1px !important;
}

::v-deep ul.pagination-list {
  justify-content: flex-end;
}

.level {
  padding-bottom: 0.5rem !important;
}


.table {
  background: none;
  position: relative;
  margin-bottom: 0 !important;
}

td.prop-label {
  white-space: nowrap;
  font-weight: 600;
}

td.prop-content {
  width: 100%;
}

td.prop-content-half {
  width: 50%;
}

.format {
  text-transform: uppercase;
}

.vendor-img {
  max-height: 4rem;
  max-width: 12rem;
}
</style>
