<!-- Copyright (c) 2009-2020. Authors: see NOTICE file.

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
<form @submit.prevent="clone()">
  <cytomine-modal :title="title" :active="active" @close="close()">

    <h2>{{$t('new-name')}} : </h2>
    <b-field>
      <b-input v-model="name" name="name" v-validate="'required'" />
    </b-field>

    <br/>
    <h2>Options : </h2>

    <div class="columns">
      <div class="column is-one-third">
        <b-checkbox v-model="cloneSetup">
          {{$t('clone-setup')}}
        </b-checkbox>
      </div>
      <div class="column is-one-third">
        <b-checkbox v-model="cloneMembers">
          {{$t('clone-members')}}
        </b-checkbox>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third">
        <b-checkbox v-model="cloneImages">
          {{$t('clone-images')}}
        </b-checkbox>
      </div>
      <div class="column is-one-third">
        <b-checkbox v-model="cloneAnnotations" v-if="cloneSetup && cloneMembers && cloneImages">
          {{$t('clone-annotations')}}
        </b-checkbox>
      </div>
    </div>
    <template #footer>
      <button class="button" type="button" @click="close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link">
        {{$t('button-clone')}}
      </button>
    </template>
  </cytomine-modal>
</form>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';
import {Project, ProjectCollection} from 'cytomine-client';
import {get} from '@/utils/store-helpers';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'clone-project-modal',
  extends: CytomineModal,
  props: {
    title: String,
    currentProject: null
  },
  components: {CytomineModal},
  data() {
    return {
      name: null,
      cloneSetup:true,
      cloneMembers: true,
      cloneImages: true,
      cloneAnnotations:true,
      disabled: false
    };
  },
  methods: {
    clone() {
      this.$emit('cloneProject', this.currentProject, this.name, this.cloneSetup, this.cloneMembers, this.cloneImages, this.cloneAnnotations);
    },
  },
  watch :{
  },
  async created() {
  }
};
</script>
