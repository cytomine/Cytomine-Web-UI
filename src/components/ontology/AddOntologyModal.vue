<template>
<b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
  <form @submit.prevent="createOntology()">
    <div class="modal-card add-image-modal">
      <header class="modal-card-head">
        <p class="modal-card-title">{{$t('create-ontology')}}</p>
      </header>
      <section class="modal-card-body">
        <b-field :label="$t('name')" :type="{'is-danger': errors.has('name')}" :message="errors.first('name')">
          <b-input v-model="name" name="name" v-validate="'required'" />
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$emit('update:active', false)">
          {{$t('button-cancel')}}
        </button>
        <button class="button is-link" :disabled="errors.any()">
          {{$t('button-save')}}
        </button>
      </footer>
    </div>
  </form>
</b-modal>
</template>

<script>
import {Ontology} from 'cytomine-client';

export default {
  name: 'add-ontology-modal',
  $_veeValidate: {validator: 'new'},
  props: {
    active: Boolean
  },
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
    async createOntology() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      try {
        let ontology = await new Ontology({name: this.name}).save();
        this.$notify({type: 'success', text: this.$t('notif-success-ontology-creation')});
        this.$emit('newOntology', ontology);
        this.$emit('update:active', false);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-ontology-creation')});
      }
    }
  }
};
</script>
