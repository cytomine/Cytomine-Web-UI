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
  <cytomine-modal-card :title="$t(term ? 'update-term' : 'create-term')" class="color-picker-modal">
    <b-field :label="$t('name')" :type="{'is-danger': errors.has('name')}" :message="errors.first('name')">
      <b-input v-model="name" name="name" v-validate="'required'" />
    </b-field>

    <sketch-picker v-model="color" :presetColors="presetColors" />

    <template #footer>
      <button class="button" type="button" @click="$parent.close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="errors.any()">
        {{$t('button-save')}}
      </button>
    </template>
  </cytomine-modal-card>
</form>
</template>

<script>
import {Term} from 'cytomine-client';
import {Sketch} from 'vue-color';
import CytomineModalCard from '@/components/utils/CytomineModalCard';
import {presetColors,randomColor} from '@/utils/color-manipulation.js';

export default {
  name: 'term-modal',
  props: {
    term: Object,
    ontology: Object
  },
  components: {
    'sketch-picker': Sketch,
    CytomineModalCard
  },
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      name: '',
      color: null
    };
  },
  computed: {
    presetColors() {
      return presetColors;
    }
  },
  methods: {
    async save() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      if(this.term) {
        this.update();
      }
      else {
        this.create();
      }
    },
    async create() {
      try {
        let term = await new Term({name: this.name, color: this.color.hex, ontology: this.ontology.id}).save();
        this.$notify({type: 'success', text: this.$t('notif-success-term-creation')});
        this.$emit('newTerm', term);
        this.$parent.close();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-creation')});
      }
    },
    async update() {
      let term = new Term(this.term);
      term.color = this.color.hex;
      term.name = this.name;
      try {
        await term.save();
        this.$notify({type: 'success', text: this.$t('notif-success-term-update')});
        this.$emit('updateTerm', term);
        this.$parent.close();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-update')});
      }
    }
  },
  created() {
    this.name = this.term ? this.term.name : '';
    this.color = {hex: this.term ? this.term.color : randomColor()};
  }
};
</script>

<style>
.color-picker-modal .vc-sketch {
  width: auto;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.color-picker-modal .vc-sketch-active-color {
  box-shadow: inset 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.color-picker-modal .vc-sketch-saturation-wrap {
  padding-bottom: 15vh;
}

/* hide alpha channel */
.color-picker-modal .vc-sketch-field--single:last-child {
  display: none;
}
/* --- */

.color-picker-modal .vc-sketch-sliders {
  display: flex;
  align-items: center;
}

.color-picker-modal .vc-sketch-hue-wrap {
  flex-grow: 1;
}

.color-picker-modal .vc-sketch-alpha-wrap {
  display: none;
}
</style>