<template>
<tr class="job-param-row-wrapper">
  <td>{{param.name}}</td>
  <td>
    <b-field :type="displayErrors && errorMessage ? 'is-danger': ''" :message="displayErrors ? errorMessage : ''">
      <b-input v-if="loading" loading disabled />
      <cytomine-multiselect
        v-else-if="options"
        v-model="internalValue"
        :options="options"
        track-by="id"
        :label="param.uriPrintAttribut"
        :class="{'is-danger': displayErrors && errorMessage}"
        :multiple="param.type === 'ListDomain'"
      >
        <template #option="{option}">
          <div class="is-flex" v-if="annotationObjects">
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
        </template>
      </cytomine-multiselect>
      <b-checkbox v-model="internalValue" v-else-if="param.type === 'Boolean'" />
      <b-input v-else v-model="internalValue" />
    </b-field>
  </td>
</tr>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {Cytomine} from 'cytomine-client';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';

export default {
  name: 'job-parameter-row',
  components: {CytomineMultiselect},
  props: {
    param: Object,
    displayErrors: Boolean
  },
  data() {
    return {
      internalValue: null,
      options: null,
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
        result = result.replace('$currentOntology$', this.ontology.id);
        return result;
      }
    },
    empty() {
      return !this.internalValue;
    },
    validNumber() {
      return !isNaN(this.internalValue);
    },
    errorMessage() {
      if(this.empty && this.param.type !== 'Boolean') {
        return this.param.required ? this.$t('mandatory-parameter') : null;
      }
      if(this.param.type === 'Number' && !this.validNumber) {
        return this.$t('must-be-number');
      }
    },
    annotationObjects() {
      if(this.options && this.options.length > 0) {
        let cytoClass = this.options[0].class;
        return [
          'be.cytomine.ontology.AlgoAnnotation',
          'be.cytomine.ontology.UserAnnotation',
          'be.cytomine.ontology.ReviewedAnnotation'
        ].includes(cytoClass);
      }
    }
  },
  watch: {
    internalValue() {
      if(this.internalValue !== this.param.value) {
        this.$emit('changeValue', {value: this.internalValue, valid: !this.errorMessage});
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
    }
  },
  async created() {
    this.internalValue = this.getInitialValue();

    if(this.processedUri) {
      try {
        let {data} = await Cytomine.instance.api.get(this.processedUri);
        let options = data.collection.filter(option => option); // HACK because some returned values may be null (TODO fix in core - occurs for cytomine-user-job)
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
</style>
