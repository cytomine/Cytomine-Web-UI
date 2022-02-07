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
  <cytomine-modal-card :title="$t('update-color')" class="color-picker-modal">
    <sketch-picker v-model="color" :presetColors="presetColors" />

    <template #footer>
      <button class="button" type="button" @click="$parent.close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link">
        {{$t('button-confirm')}}
      </button>
    </template>
  </cytomine-modal-card>
</form>
</template>

<script>
import {Sketch} from 'vue-color';
import CytomineModalCard from '@/components/utils/CytomineModalCard';
import {presetColors, randomColor} from '@/utils/color-manipulation.js';

export default {
  name: 'color-modal',
  props: {
    topMenuColor: String
  },
  components: {
    'sketch-picker': Sketch,
    CytomineModalCard
  },
  data() {
    return {
      color: null
    };
  },
  computed: {
    presetColors() {
      return presetColors;
    }
  },
  methods: {
    save() {
      this.$emit('updateColor', this.color.hex);
      this.$parent.close();
    }
  },
  created() {
    this.color = {hex: this.topMenuColor ? this.topMenuColor : randomColor()};
  }
};
</script>
