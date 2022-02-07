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
  <h2>{{$t('protocol-values')}}</h2>
  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-staining')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="staining"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-staining-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-laboratory')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="laboratory"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-laboratory-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-antibody')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="antibody"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-antibody-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-detection')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="detection"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-detection-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-dilution')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="dilution"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-dilution-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('hv-instrument')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <h-v-metadata type="instrument"/>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('hv-instrument-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

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
            v-on:updateColor="updateColor($event.target.value)"
            v-model="topMenuColorConfig.value"
            placeholder=""
          />
        </div>
        <button class="button color-picker-button" :style="`background-color:${topMenuColorConfig.value};`" @click="openModal()"></button>  
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
import HVMetadata from '@/components/property/HVMetadata';
import constants from '@/utils/constants.js';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import ColorModal from './ColorModal';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor, CytomineMultiselect, HVMetadata},
  data() {
    return {
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'}),
      sharedAnnotationMailMode: new Configuration({key: constants.CONFIG_KEY_SHARE_ANNOTATION_EMAIL_MODE, value: 'classic', readingRole: 'all'}),
      topMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
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
        if(!this.topMenuColorConfig.value && this.topMenuColorConfig.id!=null) {
          await this.topMenuColorConfig.delete();
        }
        else if (this.topMenuColorConfig.value) {
          await this.topMenuColorConfig.save();
        }
        if(!this.logoConfig.value && this.logoConfig.id!=null) {
          await this.logoConfig.delete();
        }
        else if (this.logoConfig.value) {
          await this.logoConfig.save();
        }
        this.$notify({type: 'success', text: this.$t('notif-success-configuration-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-configuration-update')});
      }
    },
    updateColor(color) {
      this.topMenuColorConfig.value = color;
    },
    openModal() {
      this.$buefy.modal.open({
        parent: this,
        component: ColorModal,
        props: {
          topMenuColor: this.topMenuColorConfig ? this.topMenuColorConfig.value : null,
        },
        events: {
          updateColor: this.updateColor,
        },
        hasModalCard: true
      });
    },
  },
  async created() {
    try {
      await this.welcomeConfig.fetch();
    }
    catch(error) {
      // no welcome message currently set
    }
    try {
      await this.sharedAnnotationMailMode.fetch();
      await this.topMenuColorConfig.fetch();
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
