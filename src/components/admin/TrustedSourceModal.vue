<template>
  <form @submit.prevent="save()">
    <cytomine-modal :active="active" :title="title" @close="$emit('update:active', false)">
      <b-field
        v-for="{field, validationRules, disabled} in editableFields"
        :key="field"
        :label="$t(fieldLabels[field])"
        horizontal
        :type="{'is-danger': errors.has(field)}"
        :message="errors.first(field)"
      >
        <b-input
          v-model="internalSource[field]"
          :name="field"
          v-validate="validationRules"
          placeholder=""
          :disabled=disabled
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
import {TrustedSource} from 'cytomine-client';

import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'trusted-source-modal',
  props: {
    active: Boolean,
    source: Object
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      internalSource: {},
      displayErrors: false
    };
  },
  computed: {
    editionMode() {
      return Boolean(this.source);
    },
    title() {
      return this.$t(this.editionMode ? 'update-source' : 'create-source');
    },
    editableFields() {
      return [
        {field: 'username', validationRules: 'required', disabled: false},
        {field: 'dockerUsername', validationRules: 'required', disabled: false},
        {field: 'prefix', validationRules: '', disabled: false},
        {field: 'provider', validationRules: 'required', disabled: true},
        {field: 'environmentProvider', validationRules: 'required', disabled: true},
      ];
    },
    fieldLabels() {
      return {
        'provider': 'source-provider',
        'username': 'source-provider-name',
        'environmentProvider': 'environment-provider',
        'dockerUsername': 'environment-provider-name',
        'prefix': 'prefix'
      };
    }
  },
  watch: {
    active(val) {
      if(val) {
        this.internalSource = this.formatSource(this.source ? this.source.clone() : new TrustedSource());
        this.displayErrors = false;
      }
    }
  },
  methods: {
    async save() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      let labelTranslation = this.editionMode ? 'update' : 'creation';

      try {
        let source = (await this.internalSource.save());
        this.internalSource = this.formatSource(source);
        this.$notify({type: 'success', text: this.$t('notif-success-source-' + labelTranslation)});
        this.$emit('update:active', false);
        this.$emit(this.editionMode ? 'updateSource' : 'addSource', this.internalSource);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-source-' + labelTranslation)});
      }
    },
    formatSource(source) {
      source.environmentProvider = 'docker';
      source.provider = (!source.provider) ? 'github' : source.provider;
      return source;
    }
  },
};
</script>

<style scoped>
>>> .modal-card, >>> .modal-card-body {
  width: 100vw;
  max-width: 800px;
}
</style>
