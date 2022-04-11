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
  <h2>{{$t('welcome-message')}}</h2>
  <cytomine-quill-editor v-model="welcomeConfig.value" />


  <hr/>
  <h2>{{$t('top-menu')}}</h2>
  <div class="columns is-vcentered">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('top-menu-color')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <div class="columns">
        <div class="column is-four-fifths">
          <b-input
            v-on:updateMenuColor="updateMenuColor($event.target.value)"
            v-model="topMenuColorConfig.value"
            placeholder=""
          />
        </div>
        <button class="button color-picker-button" :style="`background-color:${topMenuColorConfig.value};`" @click="openMenuColorModal()"></button>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('top-menu-color-description')}} <br/>
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">{{$t('top-menu-color-list')}}</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns is-vcentered">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('top-font-menu-color')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <div class="columns">
        <div class="column is-four-fifths">
          <b-input
            v-on:updateFontMenuColor="updateFontMenuColor($event.target.value)"
            v-model="topFontMenuColorConfig.value"
            placeholder=""
          />
        </div>
        <button class="button color-picker-button" :style="`background-color:${topFontMenuColorConfig.value};`" @click="openFontMenuColorModal()"></button>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('top-font-menu-color-description')}} <br/>
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">{{$t('top-menu-color-list')}}</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>


  <div class="columns" style="height: 6.5em;">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('logo')}}</h3>
    </div>
    <div class="column is-one-quarter has-text-centered">
      <div class="upload-container">
        <div v-if="!fetching">
          <b-upload v-model="selectedImage" type="is-link" drag-drop :disabled="logoConfig.value != '' ? true : false" >
              <div class="content has-text-centered b-upload">
                <template v-if="!logoConfig.value">
                  <p><i class="fas fa-upload fa-3x"></i></p>
                  <p>{{$t('choose-file-or-drop')}}</p>
                </template>
                <div v-else>
                  <div class="cross" @click="resetLogoConfig">X</div>
                  <img :src="logoConfig.value" id="upload_logo" alt="Logo" class="logo"/>
                </div>
            </div>
          </b-upload>
        </div>
        <div v-if="!isValidImage()">
          <b-field
            type="is-danger"
            :message="$t('logo-upload-error-message')">
          </b-field>
        </div>
        <div v-if="!isValidSVG()">
          <b-field
            type="is-danger"
            :message="$t('logo-upload-svg-error-message')">
          </b-field>
        </div>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('logo-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>


  <hr/>
  <h2>{{$t('temporary-data-settings')}}</h2>
  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('activities-time-to-live-in-hours')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <b-input
        v-model="activitiesRetentionDelayConfig.value"
        placeholder=""
      />
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('activities-time-to-live-in-hours-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>



  <hr/>
  <h2>{{$t('mail-settings')}}</h2>
  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('shared-annotation-mail-mode')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <cytomine-multiselect
        v-model="sharedAnnotationMailMode.value"
        :options="['classic', 'restricted']"
        :allow-empty="false"
        :searchable="false"
      />

    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('shared-annotation-mail-mode-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>

</div>
</template>

<script>
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import {Configuration} from 'cytomine-client';
import constants from '@/utils/constants.js';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import ColorModal from './ColorModal';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor, CytomineMultiselect},
  data() {
    return {
      fetching: true,
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'}),
      sharedAnnotationMailMode: new Configuration({key: constants.CONFIG_KEY_SHARE_ANNOTATION_EMAIL_MODE, value: 'classic', readingRole: 'all'}),
      activitiesRetentionDelayConfig: new Configuration({key: constants.CONFIG_KEY_ACTIVITIES_RETENTION_DELAY_IN_DAYS, value: '0', readingRole: 'all'}),
      topMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      topFontMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_FONT_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      logoConfig: new Configuration({key: constants.CONFIG_KEY_LOGO_TOP_MENU, value: '', readingRole: 'all'}),
      isLogoConfigPresent: false,
      selectedImage: null,
      selectedImageSize: {width: 0, height: 0},
    };
  },
  watch: {
    selectedImage(file) {
      if (file) {

        let reader = new FileReader();

        // Read file and return the content as base 64 encoded string
        reader.readAsDataURL(file);
        reader.onload = evt => {

          let img = new Image();
          img.onload = () => {
            this.selectedImageSize.width = img.width;
            this.selectedImageSize.height = img.height;
          };

          let encodedFile = evt.target.result;
          this.logoConfig.value = encodedFile;
          img.src = encodedFile;
        };

      }
    }
  },
  methods: {
    isSVG(){
      return this.selectedImage.type == 'image/svg+xml';
    },
    isValidSVG(){
      if(this.selectedImage && this.isSVG()){
        return (this.selectedImage.size <= 7500);
      }
      return true;
    },
    isValidImage(){
      if(this.selectedImage && !this.isSVG()){
        return (this.selectedImageSize.width <= 250 && this.selectedImageSize.height <= 250);
      }
      return true;
    },
    async save() {
      try {
        if(!this.isValidSVG()) {
          this.$notify({type: 'error', text: this.$t('logo-upload-svg-error-message')});
          throw new TypeError(this.$t('logo-upload-svg-error-message'));
        }
        else if(!this.isValidImage()) {
          this.$notify({type: 'error', text: this.$t('logo-upload-error-message')});
          throw new TypeError(this.$t('logo-upload-error-message'));
        }
        if(!this.welcomeConfig.value) {
          await this.welcomeConfig.delete();
        }
        else {
          await this.welcomeConfig.save();
        }
        if(!this.sharedAnnotationMailMode.value && this.sharedAnnotationMailMode.id!=null) {
          await this.sharedAnnotationMailMode.delete();
        }
        else if (this.sharedAnnotationMailMode.value) {
          await this.sharedAnnotationMailMode.save();
        }
        if(!this.activitiesRetentionDelayConfig.value && this.activitiesRetentionDelayConfig.id!=null) {
          await this.activitiesRetentionDelayConfig.delete();
        }
        else if (this.activitiesRetentionDelayConfig.value) {
          await this.activitiesRetentionDelayConfig.save();
        }

        if(!this.topMenuColorConfig.value && this.topMenuColorConfig.id!=null) {
          await this.topMenuColorConfig.delete();
        }
        else if (this.topMenuColorConfig.value) {
          await this.topMenuColorConfig.save();
        }
        if(!this.topFontMenuColorConfig.value && this.topFontMenuColorConfig.id!=null) {
          await this.topFontMenuColorConfig.delete();
        }
        else if (this.topFontMenuColorConfig.value) {
          await this.topFontMenuColorConfig.save();
        }
        if(!this.logoConfig.value && this.isLogoConfigPresent) {
          this.isLogoConfigPresent = false;
          await this.logoConfig.delete();
        }
        else if (this.logoConfig.value) {
          this.isLogoConfigPresent = true;
          await this.logoConfig.save();
        }
        this.$eventBus.$emit('configChanged', '');
        this.$notify({type: 'success', text: this.$t('notif-success-configuration-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-configuration-update')});
      }
    },
    openModal(props, events) {
      this.$buefy.modal.open({
        parent: this,
        component: ColorModal,
        props,
        events,
        hasModalCard: true
      });
    },
    updateMenuColor(color) {
      this.topMenuColorConfig.value = color;
    },
    updateFontMenuColor(fontColor) {
      this.topFontMenuColorConfig.value = fontColor;
    },
    openMenuColorModal() {
      let props = {
        currentColor: this.topMenuColorConfig ? this.topMenuColorConfig.value : null,
      };
      let events= {
        updateColor: this.updateMenuColor,
      };
      this.openModal(props, events);
    },
    openFontMenuColorModal() {
      let props = {
        currentColor: this.topFontMenuColorConfig ? this.topFontMenuColorConfig.value : null,
      };
      let events= {
        updateColor: this.updateFontMenuColor,
      };
      this.openModal(props, events);
    },

    resetLogoConfig(event) {
      event.preventDefault();
      this.logoConfig.value = '';
      this.selectedImage = null;
    }
  },
  async created() {
    try {
      await this.welcomeConfig.fetch();
      await this.activitiesRetentionDelayConfig.fetch();
    }
    catch(error) {
      // no welcome message currently set
    }
    try {
      await this.sharedAnnotationMailMode.fetch();
      await this.topMenuColorConfig.fetch();
      await this.topFontMenuColorConfig.fetch();
    }
    catch(error) {
      // ignored
    }
    try {
      await this.logoConfig.fetch();
      if(this.logoConfig.value){
        this.isLogoConfigPresent = true;
      }
    }
    catch(error) {
      // ignored
    }
    this.fetching = false;
  }
};
</script>

<style scoped>

.upload-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 90%;
}

>>> .cytomine-quill-editor {
  min-height: 25em !important;
  max-height: 25em !important;
}

.button {
  margin-top: 1em;
}

.color-picker-button {
  margin-top: 0.75em;
  width: 2.25em;
}

.b-upload{
  padding: 0em 0.5em 0em 0.5em;
  width: 20em;
  height: 6em;
  opacity: 1;
}

.logo{
  margin-top: 0.5em;
  margin-left: 1.5em;
  max-width : 30%;
}

.cross{
  float: right;
  transform: scale(1.5, 1.2);
  cursor: pointer;
}

</style>

<style>

.upload .upload-draggable.is-disabled {
  opacity: 1;
  cursor: not-allowed;
}

</style>
