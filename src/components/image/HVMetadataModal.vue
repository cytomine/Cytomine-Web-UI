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
<form @submit.prevent="setMetadata()">
  <cytomine-modal :active="active" :title="$t('set-metadata')" @close="$emit('update:active', false)">
    <b-message v-if="!image.class.includes('AbstractImage')" type="is-warning" has-icon icon-size="is-small">
      {{ $t('warning-change-applies-in-project-only') }}
    </b-message>

    <b-field :label="$t('hv-laboratory')" :type="fieldType" :message="errors.first('laboratory')">
      <!--<b-input v-model="newMagnification" name="magnification" v-validate="'decimal|positive'" />-->
      <cytomine-multiselect
        v-model="selectedLab"
        :options="laboratories"
        :close-on-select="true"
        label="value" track-by="id"
      />
    </b-field>
    <b-field :label="$t('hv-staining')" :type="fieldType" :message="errors.first('laboratory')">
      <cytomine-multiselect
        v-model="selectedStaining"
        :options="stainings"
        :close-on-select="true"
        label="value" track-by="id"
      />
    </b-field>
    <b-field :label="$t('hv-antibody')" :type="fieldType" :message="errors.first('laboratory')">
      <cytomine-multiselect
        v-model="selectedAntibody"
        :options="antibodies"
        :close-on-select="true"
        label="value" track-by="id"
      />
    </b-field>
    <b-field :label="$t('hv-dilution')" :type="fieldType" :message="errors.first('laboratory')">
      <cytomine-multiselect
        v-model="selectedDilution"
        :options="dilutions"
        :close-on-select="true"
        label="value" track-by="id"
      />
    </b-field>
    <b-field :label="$t('hv-detection')" :type="fieldType" :message="errors.first('laboratory')">
      <cytomine-multiselect
        v-model="selectedDetection"
        :options="detections"
        :close-on-select="true"
        label="value" track-by="id"
      />
    </b-field>
    <b-field :label="$t('hv-instrument')" :type="fieldType" :message="errors.first('laboratory')">
      <cytomine-multiselect
        v-model="selectedInstrument"
        :options="instruments"
        :close-on-select="true"
        label="value" track-by="id"
      />
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
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import {HVMetadataCollection} from 'cytomine-client';

export default {
  name: 'h-v-metadata-modal',
  props: {
    active: {type: Boolean},
    image: {type: Object}
  },
  components: {CytomineModal,CytomineMultiselect},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      newMagnification: '',
      laboratories:[],
      selectedLab: null,
      stainings: [],
      selectedStaining: null,
      antibodies: [],
      selectedAntibody: null,
      dilutions: [],
      selectedDilution: null,
      detections: [],
      selectedDetection: null,
      instruments: [],
      selectedInstrument: null,
    };
  },
  computed: {
    blindMode() {
      return this.$store.state.currentProject.project.blindMode;
    },
    fieldType() {
      return {'is-danger': this.errors.has('magnification')};
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.selectedLab = this.laboratories.find(lab => lab.id === this.image.laboratory);
        this.selectedStaining = this.stainings.find(s => s.id === this.image.staining);
        this.selectedAntibody = this.antibodies.find(a => a.id === this.image.antibody);
        this.selectedDilution = this.dilutions.find(d => d.id === this.image.dilution);
        this.selectedDetection = this.detections.find(d => d.id === this.image.detection);
        this.selectedInstrument = this.instruments.find(i => i.id === this.image.instrument);
      }
    }
  },
  methods: {
    async setMetadata() {
      /*let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }*/

      let imageName;
      if(this.image.class.includes('AbstractImage')) {
        imageName = this.image.originalFilename;
      }
      else {
        imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
      }
      try {

        let updateImage = this.image.clone();

        updateImage.laboratory = this.selectedLab ? this.selectedLab.id : null;
        updateImage.staining = this.selectedStaining ? this.selectedStaining.id : null;
        updateImage.antibody = this.selectedAntibody ? this.selectedAntibody.id : null;
        updateImage.dilution = this.selectedDilution ? this.selectedDilution.id : null;
        updateImage.detection = this.selectedDetection ? this.selectedDetection.id : null;
        updateImage.instrument = this.selectedInstrument ? this.selectedInstrument.id : null;

        await updateImage.save();

        this.$emit('setMetadata', this.selectedLab, this.selectedStaining, this.selectedAntibody,
          this.selectedDilution, this.selectedDetection, this.selectedInstrument);

        this.$notify({
          type: 'success',
          text: this.$t('notif-success-metadata-update', {imageName})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-metadata-update', {imageName})
        });
      }
      this.$emit('update:active', false);
    },
    async loadMetadata(type) {
      let metadatas;
      if(type == 'staining') metadatas = (await HVMetadataCollection.fetchStaining());
      else if(type == 'laboratory') metadatas = (await HVMetadataCollection.fetchLaboratory());
      else if(type == 'antibody') metadatas = (await HVMetadataCollection.fetchAntibody());
      else if(type == 'detection') metadatas = (await HVMetadataCollection.fetchDetection());
      else if(type == 'dilution') metadatas = (await HVMetadataCollection.fetchDilution());
      else if(type == 'instrument') metadatas = (await HVMetadataCollection.fetchInstrument());
      else metadatas = [];
      return metadatas;
    },
  },
  async created() {
    this.laboratories = await this.loadMetadata('laboratory');
    this.stainings = await this.loadMetadata('staining');
    this.antibodies = await this.loadMetadata('antibody');
    this.dilutions = await this.loadMetadata('dilution');
    this.detections = await this.loadMetadata('detection');
    this.instruments = await this.loadMetadata('instrument');
  }
};
</script>
