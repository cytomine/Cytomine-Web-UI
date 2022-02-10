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
  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>


  <hr/>
  <h2>{{$t('top-menu')}}</h2>
  <div class="columns">
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
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">Color list</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
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
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">Color list</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>


  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('logo')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <b-input
        v-model="logoConfig.value"
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
      <h3>{{$t('to-delete-at-configuration')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <b-input
        v-model="toDeleteAtDelayConfig.value"
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
              {{$t('to-delete-at-configuration-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

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
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'}),
      sharedAnnotationMailMode: new Configuration({key: constants.CONFIG_KEY_SHARE_ANNOTATION_EMAIL_MODE, value: 'classic', readingRole: 'all'}),
      toDeleteAtDelayConfig: new Configuration({key: constants.CONFIG_KEY_DELETE_PROJECT_AFTER_DELAY_IN_DAYS, value: '', readingRole: 'all'}),
      activitiesRetentionDelayConfig: new Configuration({key: constants.CONFIG_KEY_ACTIVITIES_RETENTION_DELAY_IN_DAYS, value: '0', readingRole: 'all'}),
      topMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      topFontMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_FONT_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      logoConfig: new Configuration({key: constants.CONFIG_KEY_LOGO_TOP_MENU, value: '', readingRole: 'all'})
    };
  },
  methods: {
    async save() {
      try {
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
        if(!this.toDeleteAtDelayConfig.value && this.toDeleteAtDelayConfig.id!=null) {
          await this.toDeleteAtDelayConfig.delete();
        }
        else if (this.toDeleteAtDelayConfig.value) {
          await this.toDeleteAtDelayConfig.save();
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
        if(!this.logoConfig.value && this.logoConfig.id!=null) {
          await this.logoConfig.delete();
        }
        else if (this.logoConfig.value) {
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

  },
  async created() {
    try {
      await this.welcomeConfig.fetch();
      await this.toDeleteAtDelayConfig.fetch();
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
    }
    catch(error) {
      // ignored
    }
  }
};
</script>

<style scoped>
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

</style>
