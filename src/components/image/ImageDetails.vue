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
<div class="image-details-wrapper">
  <table class="table">
    <tbody>
      <tr v-if="isPropDisplayed('overview')">
        <td class="prop-label">{{$t('overview')}}</td>
        <td class="prop-content">
          <router-link :to="`/project/${image.project}/image/${image.id}`">
            <img :src="image.thumb" class="image-overview">
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('status')">
        <td class="prop-label">{{$t('status')}}</td>
        <td class="prop-content">
          <image-status :image="image" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfAnnotations')">
        <td class="prop-label">{{$t('user-annotations')}}</td>
        <td class="prop-content">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=user`">
            {{ image.numberOfAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfJobAnnotations')">
        <td class="prop-label">{{$t('analysis-annotations')}}</td>
        <td class="prop-content">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
            {{ image.numberOfJobAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
        <td class="prop-label">{{$t('reviewed-annotations')}}</td>
        <td class="prop-content">
          <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
            {{ image.numberOfReviewedAnnotations }}
          </router-link>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('description')">
        <td class="prop-label">{{$t('description')}}</td>
        <td class="prop-content">
          <cytomine-description :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('tags')">
        <td class="prop-label">{{$t('tags')}}</td>
        <td class="prop-content">
          <cytomine-tags :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('properties')">
        <td class="prop-label">{{$t('properties')}}</td>
        <td class="prop-content">
          <cytomine-properties :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('attached-files')">
        <td class="prop-label">{{$t('attached-files')}}</td>
        <td class="prop-content">
          <attached-files :object="image" :canEdit="canEdit" />
        </td>
      </tr>
      <tr v-if="isPropDisplayed('slide-preview')">
        <td class="prop-label">{{$t('slide-preview')}}</td>
        <td class="prop-content">
          <a v-if="image.macroURL" @click="isMetadataModalActive = true">
            <img :src="image.macroURL" class="image-overview">
          </a>
          <em v-else>
            {{$t('slide-preview-not-available')}}
          </em>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('original-filename') && (!blindMode || canManageProject)">
        <td class="prop-label">{{$t('originalFilename')}}</td>
        <td class="prop-content">
          {{image.originalFilename}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('format')">
        <td class="prop-label">{{$t('format')}}</td>
        <td class="prop-content format">
          {{image.extension}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('vendor')">
        <td class="prop-label">{{$t('vendor')}}</td>
        <td class="prop-content">
          <img v-if="vendor" :src="vendor.imgPath" :alt="vendor.name" :title="vendor.name" class="vendor-img">
          <template v-else>{{$t('unknown')}}</template>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('size')">
        <td class="prop-label">{{$t('image-size')}}</td>
        <td class="prop-content">
          {{`${image.width} x ${image.height} ${$t('pixels')}`}}
        </td>
      </tr>
      <tr v-if="isPropDisplayed('resolution')">
        <td class="prop-label">{{$t('resolution')}}</td>
        <td class="prop-content">
          <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t('um-per-pixel')}}</template>
          <template v-else>{{$t('unknown')}}</template>
        </td>
      </tr>
      <tr v-if="isPropDisplayed('magnification')">
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
            <button v-if="isPropDisplayed('metadata')" class="button" @click="isMetadataModalActive = true">
              {{$t('button-metadata')}}
            </button>
            <template v-if="canEdit">

              <router-link
                v-if="!image.reviewed && !image.inReview"
                :to="`/project/${image.project}/image/${image.id}?action=review`"
                class="button"
              >
                {{$t('button-start-review')}}
              </router-link>

              <template v-else-if="image.reviewUser === currentUser.id">
                <button v-if="image.reviewed" class="button" @click="cancelReview()">
                  {{$t('button-unvalidate-review')}}
                </button>
                <template v-else>
                  <router-link :to="`/project/${image.project}/image/${image.id}?action=review`" class="button">
                    {{$t('button-continue-review')}}
                  </router-link>
                  <button class="button" @click="cancelReview()">
                    {{$t('button-cancel-review')}}
                  </button>
                </template>
              </template>

              <button v-if="!blindMode || canManageProject" class="button" @click="isRenameModalActive = true">
                {{$t('button-rename')}}
              </button>
              <button class="button" @click="isCalibrationModalActive = true">
                {{$t('button-set-calibration')}}
              </button>
              <button class="button" @click="isMagnificationModalActive = true">
                {{$t('button-set-magnification')}}
              </button>
            </template>
            <a class="button" v-if="canDownloadImages || canManageProject" :href="image.downloadURL">
              {{$t('button-download')}}
            </a>
            <template v-if="canEdit">
              <button class="button is-danger" @click="confirmDeletion()">
                {{$t('button-delete')}}
              </button>
            </template>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <rename-modal
    :title="$t('rename-image')"
    :currentName="image.instanceFilename"
    :active.sync="isRenameModalActive"
    @rename="rename"
  />

  <magnification-modal
    :image="image"
    :active.sync="isMagnificationModalActive"
    @setMagnification="(event) => $emit('setMagnification', event)"
  />

  <calibration-modal
    :image="image"
    :active.sync="isCalibrationModalActive"
    @setResolution="(event) => $emit('setResolution', event)"
  />

  <image-metadata-modal
    :active.sync="isMetadataModalActive"
    :image="image"
  />
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import CytomineTags from '@/components/tag/CytomineTags';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import MagnificationModal from './MagnificationModal';
import CalibrationModal from './CalibrationModal';
import ImageMetadataModal from './ImageMetadataModal';
import ImageStatus from './ImageStatus';
import RenameModal from '@/components/utils/RenameModal';
import {ImageInstance} from 'cytomine-client';

import vendorFromMime from '@/utils/vendor';

export default {
  name: 'image-details',
  components: {
    CytomineDescription,
    CytomineTags,
    CytomineProperties,
    AttachedFiles,
    MagnificationModal,
    CalibrationModal,
    ImageMetadataModal,
    ImageStatus,
    RenameModal
  },
  props: {
    image: {type: Object},
    excludedProperties: {type: Array, default: () => []},
    editable: {type: Boolean, default: false}
  },
  data() {
    return {
      isRenameModalActive: false,
      isCalibrationModalActive: false,
      isMagnificationModalActive: false,
      isMetadataModalActive: false,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    blindMode() {
      return ((this.$store.state.currentProject.project || {}).blindMode) || false;
    },
    canDownloadImages() {
      return ((this.$store.state.currentProject.project || {}).areImagesDownloadable) || false;
    },
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    canEdit() {
      return this.editable && this.$store.getters['currentProject/canEditImage'](this.image);
    },
    imageNameNotif() {
      return this.blindMode ? this.image.blindedName : this.image.instanceFilename;
    },
    vendor() {
      return vendorFromMime(this.image.mime);
    }
  },
  methods: {
    isPropDisplayed(prop) {
      return !this.excludedProperties.includes(prop) && this.configUI[`project-explore-image-${prop}`];
    },

    async cancelReview() {
      let errorLabel = this.image.reviewed ? 'notif-error-unvalidate-review' : 'notif-error-cancel-review';
      try {
        await this.image.stopReview(true);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t(errorLabel)});
      }
    },

    async rename(newName) {
      let oldName = this.image.instanceFilename;
      try {
        this.image.instanceFilename = newName;
        await this.image.save();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-image-rename', {imageName: this.image.instanceFilename})
        });
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

    confirmDeletion() {
      this.$buefy.dialog.confirm({
        title: this.$t('delete-image'),
        message: this.$t('delete-image-confirmation-message', {imageName: this.imageNameNotif}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: this.deleteImage
      });
    },
    async deleteImage() {
      try {
        await ImageInstance.delete(this.image.id);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-image-deletion', {imageName: this.imageNameNotif})
        });
        this.$emit('delete');

        let updatedProject = this.$store.state.currentProject.project.clone();
        updatedProject.numberOfImages--;
        this.$store.dispatch('currentProject/updateProject', updatedProject);
      }
      catch(err) {
        console.log(err);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-image-deletion', {imageName: this.imageNameNotif})
        });
      }
    }
  }
};
</script>

<style scoped>
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

.format {
  text-transform: uppercase;
}

.vendor-img {
  max-height: 4rem;
  max-width: 12rem;
}

.image-overview {
  max-height: 18rem;
  max-width: 50vw;
}
</style>
