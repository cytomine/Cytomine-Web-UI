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
<form @submit.prevent="setResolution()">
  <cytomine-modal :active="active" :title="$t('calibrate-image')" @close="$emit('update:active', false)">
    <b-message type="is-warning" has-icon icon-size="is-small">
      {{ $t('warning-change-applies-in-project-only') }}
    </b-message>

    <b-field :label="$t('resolution')" :type="fieldType" :message="errors.first('resolution')">
      <b-field :type="fieldType">
        <b-input v-model="calibrationField" name="resolution" v-validate="'required|decimal|positive'" expanded />
        <b-select v-model="calibrationFactor">
          <option :value="0.001"> {{ $t('nm-per-pixel') }}</option>
          <option :value="1">{{ $t('um-per-pixel') }}</option>
          <option :value="1000">{{ $t('mm-per-pixel') }}</option>
        </b-select>
      </b-field>
    </b-field>

    <template #footer>
      <button class="button" type="button" @click="$emit('update:active', false)">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="errors.any()">
        {{$t('button-save')}}
      </button>
    </template>
  </cytomine-modal>
</form>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'calibration-modal',
  props: {
    active: {type: Boolean},
    image: {type: Object}
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      calibrationField: '',
      calibrationFactor: 1
    };
  },
  computed: {
    blindMode() {
      return this.$store.state.currentProject.project.blindMode;
    },
    fieldType() {
      return {'is-danger': this.errors.has('resolution')};
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.calibrationField = this.image.resolution;
      }
    }
  },
  methods: {
    async setResolution() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      let imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
      try {
        let updateImage = this.image.clone();
        updateImage.resolution = Number(this.calibrationField)*this.calibrationFactor;
        await updateImage.save();

        this.$emit('setResolution', updateImage.resolution);

        this.$notify({
          type: 'success',
          text: this.$t('notif-success-image-calibration', {imageName})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-image-calibration', {imageName})
        });
      }
      this.$emit('update:active', false);
    }
  }
};
</script>
