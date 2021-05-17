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
<tr class="job-param-row-wrapper">
  <td>
    <div v-if="description">
      <v-popover :popover-base-class="'tooltip popover job-description-popover'">
        <i class="fas fa-info-circle"></i>
        <template #popover>
          <p v-html="description.data"></p>
        </template>
      </v-popover>
    </div>
  </td>
  <td>{{param.humanName}}</td>
  <td>
    <b-field :type="{'is-danger': errors.has(validationName)}" :message="errors.first(validationName)">
      <b-input v-if="loading" loading disabled />

      <cytomine-multiselect
        v-else-if="options"
        v-model="internalValue"
        :options="options"
        track-by="id"
        :label="param.uriPrintAttribut"
        :class="{'is-danger': errors.has(validationName)}"
        :multiple="param.type === 'ListDomain'"
        :name="validationName"
        v-validate="validationRules"
      >
        <template #option="{option}">
          <div class="is-flex" v-if="areAnnotationObjects">
            <div class="thumb-wrapper">
              <img class="thumb" :src="option.smallCropURL + '&draw=true&complete=true&increaseArea=1.25'">
            </div>
            <span class="option__title">
              {{ option[param.uriPrintAttribut] }}
            </span>
          </div>
          <div class="is-flex" v-else-if="option.thumb">
            <div class="thumb-wrapper">
              <img class="thumb" :src="option.thumb">
            </div>
            <span class="option__title">
              {{ option[param.uriPrintAttribut] }}
            </span>
          </div>
          <div class="is-flex" v-else-if="areTermObjects">
            <cytomine-term :term="option" />
          </div>
          <div class="is-flex" v-else-if="areJobObjects">
            <span class="option__title">
              {{ formatJob(option, param.uriPrintAttribut) }}
            </span>
          </div>
        </template>
      </cytomine-multiselect>

      <b-checkbox v-model="internalValue" v-else-if="param.type === 'Boolean'" />

      <b-input v-else v-model="internalValue" :name="validationName" v-validate="validationRules" />
    </b-field>
  </td>
</tr>
</template>

<script>
import {get} from '@/utils/store-helpers';
import moment from 'moment';

import {Cytomine, Description} from 'cytomine-client';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineTerm from '@/components/ontology/CytomineTerm';

export default {
  name: 'job-parameter-row',
  inject: ['$validator'],
  components: {CytomineTerm, CytomineMultiselect},
  props: {
    param: Object,
    value: null
  },
  data() {
    return {
      internalValue: null,
      options: null,
      description: null,
      loading: true
    };
  },
  computed: {
    project: get('currentProject/project'),
    ontology: get('currentProject/ontology'),
    processedUri() {
      if(this.param.uri_) {
        let result = this.param.uri_.replace(new RegExp('^' + Cytomine.instance.basePath), '');
        result = result.replace('$currentProjectCreationDate$', this.project.created);
        result = result.replace('$currentProject$', this.project.id);
        result = result.replace('$cytomineHost$', Cytomine.instance.host);
        result = result.replace('$currentDate$', new Date().getTime());
        result = result.replace('$currentOntology$', this.ontology ? this.ontology.id : null);
        return result;
      }
    },
    validationName() {
      return String(this.param.id);
    },
    validationRules() {
      return {
        required: this.param.required,
        decimal: this.param.type === 'Number'
      };
    },
    objectsClass() {
      if (this.options && this.options.length > 0) {
        return this.options[0].class;
      }
    },
    areAnnotationObjects() {
      if(this.objectsClass) {
        return [
          'be.cytomine.ontology.AlgoAnnotation',
          'be.cytomine.ontology.UserAnnotation',
          'be.cytomine.ontology.ReviewedAnnotation'
        ].includes(this.objectsClass);
      }
    },
    areTermObjects() {
      return this.objectsClass === 'be.cytomine.ontology.Term';
    },
    areJobObjects() {
      return this.objectsClass === 'be.cytomine.processing.Job';
    }
  },
  watch: {
    internalValue(value) {
      if(value !== this.value) {
        this.$emit('input', value);
      }
    },
    'param.value': function() {
      this.internalValue = this.param.value;
    }
  },
  methods: {
    getInitialValue() {
      if(this.param.defaultParamValue) {
        if(this.param.type === 'Boolean') {
          return this.param.defaultParamValue.toLowerCase() === 'true';
        }
        return this.param.defaultParamValue;
      }

      switch(this.param.type) {
        case 'ListDomain':
          return [];
        case 'Domain':
          return null;
        case 'Boolean':
          return false;
        default:
          return '';
      }
    },
    formatJob(job, attribute) {
      if (['softwareName', 'created', 'fullName', 'number'].includes(attribute)) {
        let date = moment(Number(job.created)).format('L LTS');
        return `${job['softwareName']} - ${date} (#${job['number']})`;
      }

      return job[attribute];
    }
  },
  async created() {
    this.internalValue = this.getInitialValue();

    try {
      this.description = await Description.fetch(this.param);
    }
    catch(error) {
      // Do nothing as a 404 error means no description
    }

    if(this.processedUri) {
      try {
        let {data} = await Cytomine.instance.api.get(this.processedUri);
        let options = data.collection;
        if(this.param.uriSortAttribut) {
          options.sort((a, b) => a[this.param.uriSortAttribut] < b[this.param.uriSortAttribut] ? -1 : 1);
        }
        this.options = options;
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-analysis-parameters-options', {paramName: this.param.name})});
      }
    }
    this.loading = false;
  }
};
</script>

<style lang="scss">
.job-param-row-wrapper {
  .thumb-wrapper {
    width: 4em;
  }

  .thumb  {
    max-height: 5em;
    max-width: 3em;
    background: white;
  }
}

.job-description-popover {
  z-index: 5000 !important;
}

.fas.fa-info-circle {
  cursor: pointer;
}
</style>
