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
<div class="tags-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <template v-if="!loading">
    <b-field grouped group-multiline>
      <em v-if="error">{{$t('error-fetch-configurations')}}</em>
      <div class="control" v-else-if="arrayValues.length > 0" v-for="(value, idx) in arrayValues" :key="value">
        <b-taglist attached>
          <b-tag type="is-info">{{value.toUpperCase()}}</b-tag>
          <b-tag>
            <button v-if="false" class="delete is-small" :title="$t('button-delete')" @click="removeValue(value, idx)">
            </button>
          </b-tag>
        </b-taglist>
      </div>
      <em v-else-if="arrayValues.length === 0">{{$t('no-prefix')}}</em>
      <button class="button is-small" @click="displayModal()">
        {{arrayValues.length === 0 ? $t('button-add') : $t('button-edit')}}
      </button>
    </b-field>
  </template>
</div>
</template>

<script>

import {Configuration} from 'cytomine-client';
import AddConfigurationStringModal from '@/components/configuration/AddConfigurationStringModal';

export default {
  name: 'configuration-string-array',
  props: {
    configKey: String,
  },
  components: {
    AddConfigurationStringModal
  },
  data() {
    return {
      loading: true,
      error: false,
      addTagModal:false,
      associatedTags: [],
      configurationValue: null
    };
  },
  methods: {
    displayModal() {
      //this.addTagModal = true;
      // required to use programmatic modal because the description is sometimes displayed in elements with a
      // CSS transform (e.g. popover) that conflict with the fixed position of the modal
      // (http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/)

      this.$buefy.modal.open({
        parent: this,
        component: AddConfigurationStringModal,
        props: {
          initialConfigurationValue: this.configurationValue,
          title: this.$t('edit-prefix'),
          explaination: this.$t('prefix-explaination'),
        },
        hasModalCard: true,
        events: {'addObjects': this.addValues}
      });
    },
    async addValues(values){
      values = values.split(',').filter(s => s.length > 0);
      values = [...new Set(values)];
      values = values.join(',');

      try{
        this.configurationValue = (await new Configuration({key: this.configKey, value:values, readingRole:'USER'}).save()).value;
      }
      catch(error){
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-add-tags')});
      }
    },
    async removeValue(association, idx) {
      window.console.log(association+' '+idx);
    },
  },
  computed : {
    arrayValues() {
      return this.configurationValue.split(',').filter(s => s.length > 0);
    }
  },
  async created() {
    try {
      this.configurationValue = (await new Configuration({key: this.configKey}).fetch()).value;
    }
    catch(error) {
      if(error.response.status == 404) {
        //404 if configuration not set. Ignore.
        this.configurationValue = '';
      }
      else {
        console.log(error);
        this.error = true;
      }
    }
    this.loading = false;
  }
};
</script>

<style scoped>
em {
  margin-right: 0.5em;
}
</style>

<style>
.tags-wrapper .control, .tags-wrapper .tags {
  margin-bottom: 0 !important;
}

.tags-wrapper .tag {
  margin-right: 0.5em;
  margin-bottom: 0.3em !important;
  background-color: rgba(0, 0, 0, 0.04);
}

.tags-wrapper .tag.is-dark {
  background-color: rgba(0, 0, 0, 0.1);
  color: black;
}

.tags-wrapper .field.is-grouped.is-grouped-multiline {
  margin-bottom: 0 !important;
}
</style>
