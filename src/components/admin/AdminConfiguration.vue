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

</div>
</template>

<script>
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import ConfigurationStringArray from '@/components/configuration/ConfigurationStringArray';
import HVMetadata from '@/components/property/HVMetadata';
import {Configuration} from 'cytomine-client';
import constants from '@/utils/constants.js';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor, ConfigurationStringArray, HVMetadata},
  data() {
    return {
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'})
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
        this.$notify({type: 'success', text: this.$t('notif-success-welcome-message-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-welcome-message-update')});
      }
    }
  },
  async created() {
    try {
      await this.welcomeConfig.fetch();
    }
    catch(error) {
      // no welcome message currently set
    }
  }
};
</script>

<style scoped>
>>> .cytomine-quill-editor {
  min-height: 25em !important;
  max-height: 25em !important;
}

>>> .button.is-small {
  margin-left: 5em;
}

.button {
  margin-top: 1em;
}
</style>
