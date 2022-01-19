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


  <div class="panel">
    <p class="panel-heading">
      {{ $t('configuration') }}
    </p>
    <div class="panel-block storage">
      <b-field
        :label="$t('shared-annotation-mail-mode')"
        horizontal
      >
        <cytomine-multiselect
          v-model="sharedAnnotationMailMode.value"
          :options="['classic', 'restricted']"
          :allow-empty="false"
          :searchable="false"
        />

      </b-field>
    </div>

      <b-field
        :label="$t('top-menu-color')"
        horizontal
      >
        <b-input
          v-model="topMenuColorConfig.value"
          placeholder=""
        />
      </b-field>
      <b-field
        :label="$t('logo')"
        horizontal
      >
        <b-input
          v-model="logoConfig.value"
          placeholder=""
        />
      </b-field>
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

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor, CytomineMultiselect},
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
        this.$notify({type: 'success', text: this.$t('notif-success-configuration-update')});
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
        this.$notify({type: 'success', text: this.$t('notif-success-welcome-message-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-configuration-update')});
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
</style>
