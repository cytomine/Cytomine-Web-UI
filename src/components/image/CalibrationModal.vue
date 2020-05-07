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
<form @submit.prevent="setResolution()">
  <cytomine-modal :active="active" :title="$t('calibrate-image')" @close="$emit('update:active', false)" :can-cancel="!loading">
    <b-message type="is-warning" has-icon icon-size="is-small">
      {{ $t('warning-change-applies-in-project-only') }}
    </b-message>

    <div class="columns">
      <div class="column">
        <b-field
          :label="$t(pixelLength ? 'length-of-drawn-segment' : 'resolution')"
          :type="fieldType"
          :message="errors.first('resolution')"
        >
          <b-field :type="fieldType">
            <b-input v-model="calibrationField" name="resolution" v-validate="'required|decimal|positive'" expanded />
            <b-select v-model="calibrationFactor">
              <option :value="0.001"> {{ $t(pixelLength ? 'nm' : 'nm-per-pixel') }}</option>
              <option :value="1">{{ $t(pixelLength ? 'um' : 'um-per-pixel') }}</option>
              <option :value="1000">{{ $t(pixelLength ? 'mm' : 'mm-per-pixel') }}</option>
            </b-select>
          </b-field>
        </b-field>
      </div>

      <p v-if="!pixelLength" class="control column is-narrow">
        <button class="button" type="button" @click="$emit('setScale')">{{ $t('button-set-scale') }}</button>
      </p>
    </div>

    <b-field v-if="pixelLength" :label="$t('computed-resolution')" disabled>
      <b-input disabled :value="computedResolution ? `${computedResolution} ${$t('um-per-pixel')}` : '-'"></b-input>
    </b-field>

    <template #footer>
      <button class="button" type="button" @click="$emit('update:active', false)" :disabled="loading">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :class="{'is-loading': loading}" :disabled="errors.any() || loading">
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
    image: {type: Object},
    // if pixelLength is provided, the calibration modal will ask the user to provide the actual length of the annot ;
    // otherwise the resolution will be asked
    pixelLength: {type: Number, default: null}
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      calibrationField: '',
      calibrationFactor: 1,
      loading: false
    };
  },
  computed: {
    blindMode() {
      return this.$store.state.currentProject.project.blindMode;
    },
    fieldType() {
      return {'is-danger': this.errors.has('resolution')};
    },
    computedResolution() {
      let resolution = Number(this.calibrationField)*this.calibrationFactor;
      if(this.pixelLength) {
        resolution /= this.pixelLength;
      }
      return resolution;
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.calibrationField = this.pixelLength ? '' : this.image.resolution;
      }
    }
  },
  methods: {
    async setResolution() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      this.loading = true;
      let imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
      try {
        let updateImage = this.image.clone();
        updateImage.resolution = this.computedResolution;
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
      this.loading = false;
      this.$emit('update:active', false);
    }
  }
};
</script>

<style scoped>
.columns {
  align-items: flex-end;
  margin-bottom: 0px !important;
}
</style>
