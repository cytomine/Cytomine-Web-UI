<template>
<form @submit.prevent="createTag()">
  <cytomine-modal :active="active" :title="$t('new-tag')" @close="$emit('update:active', false)">
    <b-field :label="$t('name')" :type="{'is-danger': errors.has('name')}" :message="errors.first('name')">
      <b-input v-model="name" name="name" v-validate="'required'" />
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
import {get} from '@/utils/store-helpers';
import {Tag} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'add-tag-modal',
  props: {
    active: Boolean
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      name: ''
    };
  },
  watch: {
    active(val) {
      if(val) {
        this.name = '';
      }
    }
  },
  methods: {
    async createTag() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      try {
        await new Tag({name: this.name, user : get('currentUser/user')}).save();
        this.$notify({type: 'success', text: this.$t('notif-success-tag-creation')});
        this.$emit('update:active', false);
        this.$emit('addTag');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-tag-creation')});
      }
    }
  }
};
</script>
