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
<form @submit.prevent="createJob()">
  <cytomine-modal :active="active" :title="$t('launch-new-analysis')" @close="$emit('update:active', false)">
    <div class="columns">
      <div class="column is-narrow">
        <strong>{{$t('algorithm')}}</strong>
      </div>
      <div class="column">
        <cytomine-multiselect v-model="selectedSoftware" :options="executableSoftwares" track-by="id" label="fullName" />
      </div>
    </div>
    <template v-if="selectedSoftware">
      <b-message v-if="selectedSoftware.deprecated" type="is-info" has-icon icon-size="is-small">
        {{$t('notif-deprecated-software')}}
      </b-message>
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th></th>
            <th>{{$t('name')}}</th>
            <th>{{$t('value')}}</th>
          </tr>
        </thead>
        <tbody>
          <job-parameter-row
            v-for="param in paramsMandatoryNoDefault"
            :param="param"
            :key="param.id"
            v-model="param.value"
          />

          <tr class="row-separator" v-show="optionalParams.length > 0">
            <td colspan="3">
              {{$t('optional-parameters')}}
              <button class="button is-small" type="button" @click="showOptional = !showOptional">
                {{$t(showOptional ? 'button-hide' : 'button-show')}}
              </button>
            </td>
          </tr>
          <template v-if="showOptional">
            <job-parameter-row
              v-for="param in optionalParams"
              :param="param"
              :key="param.id"
              v-model="param.value"
            />
          </template>

          <tr class="row-separator" v-show="prefilledParams.length > 0">
            <td colspan="3">
              {{$t('prefilled-parameters')}}
              <button class="button is-small" type="button" @click="showPrefilled = !showPrefilled">
                {{$t(showPrefilled ? 'button-hide' : 'button-show')}}
              </button>
            </td>
          </tr>
          <template v-if="showPrefilled">
            <job-parameter-row
              v-for="param in prefilledParams"
              :param="param"
              :key="param.id"
              v-model="param.value"
            />
          </template>
        </tbody>
      </table>
    </template>

    <template #footer>
      <button class="button" type="button" @click="$emit('update:active', false)">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="errors.any()">
        {{$t('button-launch-new-analysis')}}
      </button>
    </template>
  </cytomine-modal>
</form>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {SoftwareCollection, Job, JobParameter} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import JobParameterRow from './JobParameterRow';

export default {
  name: 'add-job-modal',
  props: {
    active: Boolean
  },
  components: {
    CytomineModal,
    CytomineMultiselect,
    JobParameterRow
  },
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      softwares: [],
      selectedSoftware: null,
      showPrefilled: false,
      showOptional: false
    };
  },
  computed: {
    project: get('currentProject/project'),
    params() {
      return this.selectedSoftware ? this.selectedSoftware.parameters.array : [];
    },
    optionalParams() {
      return this.params.filter(param => !param.required && !param.defaultParamValue);
    },
    prefilledParams() {
      return this.params.filter(param => param.defaultParamValue);
    },
    paramsMandatoryNoDefault() {
      return this.params.filter(param => param.required && !param.defaultParamValue);
    },
    jobParameters() {
      return this.params
        .filter(param => {
          return param.value || param.value === 0;
        })
        .map(param => {
          let value = param.value;
          if(value.id) {
            value = value.id;
          }
          if(Array.isArray(value)) {
            if(value.length) {
              if(value[0].id) {
                value = value.map(model => model.id).join();
              }
            }
            else {
              value = null;
            }
          }
          return new JobParameter({softwareParameter: param.id, value});
        });
    },
    executableSoftwares() {
      return this.softwares.filter(s => s.executable);
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.selectedSoftware = null;
        this.showOptional = false;
        this.showPrefilled = false;
      }
    },
    async selectedSoftware() {
      if(!this.selectedSoftware) {
        return;
      }
      for(let param of this.selectedSoftware.parameters) {
        this.$set(param, 'value', param.defaultParamValue);
      }
    }
  },
  methods: {
    async createJob() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      try {
        let job = new Job({
          software: this.selectedSoftware.id,
          project: this.project.id,
          jobParameters: this.jobParameters
        });
        await job.save();
        this.$emit('add', job);
        this.$emit('update:active', false);
        await job.execute();
        this.$notify({type: 'success', text: this.$t('notif-success-analysis-launch')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-analysis-launch')});
      }
    }
  },
  async created() {
    this.softwares = (await SoftwareCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
  }
};
</script>

<style scoped>
>>> .modal-card {
  width: 100%;
  min-height: 70vh;
}

>>> .animation-content {
  min-width: 70vw;
  min-height: 70vh;
}

.columns {
  align-items: center;
}

.table {
  margin-bottom: 1em;
}

th:first-child {
  width: 5%;
}

th:nth-child(2) {
  width: 30%;
}

td, >>> td {
  vertical-align: middle !important;
}

.row-separator td {
  border-top-width: 2px !important;
  border-bottom-width: 1px !important;
  font-weight: 600;
}
</style>
