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
<div class="properties-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <template v-if="!loading">
    <b-field grouped group-multiline>
      <em v-if="error">{{$t('error-fetch-properties')}}</em>
      <div class="control" v-else-if="metadatas.length > 0" v-for="(prop, idx) in notEditedProperties" :key="prop.id">
        <b-taglist attached>
          <!--<b-tag type="is-dark">prop.key</b-tag>-->
          <b-tag>
            {{prop.value}}
            <!--<button class="edit is-small" :title="$t('button-edit')" @click="startPropEdition(prop)">
              <i class="fas fa-pencil-alt"></i>
            </button>-->
            <button class="delete is-small" :title="$t('button-delete')" @click="removeProp(idx)">
            </button>
          </b-tag>
        </b-taglist>
      </div>
      <em v-else>{{$t('no-properties')}}</em>

      <button class="button is-small add-prop" @click="addNewProp()" key="showForm">
        {{$t('button-add')}}
      </button>
    </b-field>

    <form @submit.prevent="saveProp(idx)" class="new-prop-form" v-for="(prop, idx) in editedProperties" :key="prop.id">
      <b-input size="is-small" v-model="prop.value" :placeholder="$t('value')" />
      <button class="button is-small">
        {{prop.id ? $t('button-save') : $t('button-add')}}
      </button>
      <button class="button is-small" type="button" @click="cancelPropEdition(idx)">
        {{$t('button-cancel')}}
      </button>
    </form>
  </template>
</div>
</template>

<script>
import {HVMetadata, HVMetadataCollection} from 'cytomine-client';

export default {
  name: 'h-v-metadata',
  props: {
    type: String
  },
  data() {
    return {
      loading: true,
      error: false,

      metadatas: [],
      editedProperties: [],
      newPropValue: '',
      showNewPropForm: false
    };
  },
  computed: {
    notEditedProperties() {
      let editedIds = this.editedProperties.map(prop => prop.id);
      return this.metadatas.filter(prop => !editedIds.includes(prop.id));
    }
  },
  methods: {
    addNewProp() {
      let newProp = new HVMetadata({type: this.type});
      this.editedProperties.push(newProp);
    },
    async removeProp(idx) {
      let prop = this.metadatas[idx];
      console.log('prop');
      console.log(prop);
      try {
        //await HVMetadata.delete(prop.id);
        let test = new HVMetadata(prop);
        console.log('test');
        console.log(test);
        await (test.delete());

        this.metadatas.splice(idx, 1);
        this.$emit('update');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-remove-prop')});
      }
    },
    startPropEdition(prop) {
      // store current values of key and value, so that they can be restored if needed (e.g. edit cancellation)
      prop.oldValue = prop.value;
      this.editedProperties.splice(0, 0, prop); // insert at first position
    },
    async saveProp(idx) {
      console.log('saveProp');
      let prop = this.editedProperties[idx];

      console.log('prop');
      console.log(prop);

      let newProp = prop.isNew();
      try {
        /*prop = (*/await prop.save();//);
        console.log('prop');
        console.log(prop);
        this.editedProperties.splice(idx, 1);
        if(newProp) {
          this.metadatas.push(prop);
        }
        this.$emit('update');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-save-prop')});
      }
    },
    cancelPropEdition(idx) {
      let prop = this.editedProperties[idx];
      prop.value = prop.oldValue;
      this.editedProperties.splice(idx, 1);
    },
  },
  async created() {
    try {
      if(this.type == 'staining') this.metadatas = (await HVMetadataCollection.fetchStaining());
      else if(this.type == 'laboratory') this.metadatas = (await HVMetadataCollection.fetchLaboratory());
      else if(this.type == 'antibody') this.metadatas = (await HVMetadataCollection.fetchAntibody());
      else if(this.type == 'detection') this.metadatas = (await HVMetadataCollection.fetchDetection());
      else if(this.type == 'dilution') this.metadatas = (await HVMetadataCollection.fetchDilution());
      else if(this.type == 'instrument') this.metadatas = (await HVMetadataCollection.fetchInstrument());
      else this.metadatas = [];
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    this.loading = false;
  }
};
</script>

<style scoped>
.new-prop-form {
  margin-bottom: 0.45em;
  margin-top: 0.45em;
}

.new-prop-form .button {
  margin: 0;
  margin-right: 0.45em;
}

.new-prop-form .control {
  margin-right: 0.5em;
  display: inline-block;
}

.tag button.edit {
  height: 16px;
  width: 16px;
  background-color: rgba(10, 10, 10, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  display: inline-block;
  font-size: 8px;
  padding: 0;
  outline: none;
  position: relative;
  vertical-align: top;
  color: white;
  margin-left: 0.5em;
  line-height: 17px;
}

.tag button.edit:hover {
  background-color: rgba(10, 10, 10, 0.3);
}

em {
  margin-right: 0.5em;
}
</style>

<style>
.properties-wrapper .control, .properties-wrapper .tags {
  margin-bottom: 0 !important;
}

.properties-wrapper .tag {
  margin-right: 0.5em;
  margin-bottom: 0.3em !important;
  background-color: rgba(0, 0, 0, 0.04);
}

.properties-wrapper .tag.is-dark {
  background-color: rgba(0, 0, 0, 0.1);
  color: black;
}

.properties-wrapper .field.is-grouped.is-grouped-multiline {
  margin-bottom: 0 !important;
}
</style>
