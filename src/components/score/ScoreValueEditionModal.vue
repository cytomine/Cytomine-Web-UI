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
<form @submit.prevent="save()">
  <cytomine-modal :active="active" :title="title" @close="$emit('update:active', false)">
    <b-field :label="$t('value')" :type="{'is-danger': errors.has('value')}" :message="errors.first('value')">
      <b-input v-model="internalScoreValue['value']" name="value" v-validate="'required'" />
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
  name: 'score-value-edition-modal',
  props: {
    active: Boolean,
    scoreValue: Object
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      internalScoreValue: {},
      displayErrors: false,
    };
  },
  computed: {
    title() {
      return 'update-score-value';
    },
  },
  watch: {
    active(val) {
      if(val) {
        this.internalScoreValue = this.scoreValue.clone();
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

      try {
        await this.internalScoreValue.save();
        this.$notify({type: 'success', text: this.$t('notif-success-score-value-edition')});
        this.$emit('update:active', false);
        this.$emit('updateScoreValue', this.internalScoreValue);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-score-value-edition')});
      }
    }
  }
};
</script>
