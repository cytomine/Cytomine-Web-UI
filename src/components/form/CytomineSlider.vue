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
<vue-slider
  :value="value" @change="$emit('input', $event)"
  :min="min"
  :max="max"
  :tooltip="'always'"
  :tooltip-placement="tooltipPlacement"
  :lazy="lazy"
>
  <template #tooltip="{value, index}">
    <div
      :class="['vue-slider-dot-tooltip-inner', `vue-slider-dot-tooltip-inner-${tooltipPlacement[index]}`]"
      @mousedown.stop
      @click.stop="startEdition(index)"
    >
        <template v-if="indexEdited !== index">
          {{Math.round(value * 1000)/1000}}
        </template>
        <b-input
          v-else
          type="text"
          ref="inputSlider"
          v-model="editedValue"
          @hook:mounted="focus()"
          @blur="stopEdition(index)"
          @keyup.enter.native="stopEdition(index)"
        />
    </div>
  </template>
</vue-slider>
</template>

<script>
import VueSlider from 'vue-slider-component';

export default {
  name: 'cytomine-slider',
  components: {VueSlider},
  props: {
    value: {type: null},
    min: {type: Number, default: 0},
    max: {type: Number, default: 100},
    integerOnly: {type: Boolean, default: true},
    lazy: {type: Boolean, default: true}
  },
  data() {
    return {
      indexEdited: null,
      editedValue: 0
    };
  },
  computed: {
    isArray() {
      return Array.isArray(this.value);
    },
    tooltipPlacement() {
      return this.isArray ? ['left', 'right'] : ['right'];
    }
  },
  methods: {
    startEdition(index) {
      if(this.indexEdited !== index) {
        this.editedValue = this.isArray ? this.value[index] : this.value;
        this.indexEdited = index;
      }
    },
    stopEdition(index=0) {
      if(this.indexEdited === index) {
        this.indexEdited = null;

        if(!this.editedValue || isNaN(this.editedValue)) {
          return; // if entered value is not a number, ignore
        }

        let parsedValue = this.integerOnly ? parseInt(this.editedValue) : Number(this.editedValue);
        parsedValue = Math.min(parsedValue, this.max);
        parsedValue = Math.max(parsedValue, this.min);

        if(this.isArray) {
          let newVal = this.value.slice();
          newVal[index] = parsedValue;
          if(newVal[0] > newVal[1]) { // reorder bounds if needed
            newVal.reverse();
          }
          this.$emit('input', newVal);
        }
        else {
          this.$emit('input', parsedValue);
        }
      }
    },
    focus() {
      this.$refs.inputSlider.focus();
    }
  }
};
</script>

<style lang="scss">
@import '~vue-slider-component/theme/default.css';

.vue-slider-dot-tooltip-inner {
  font-size: 0.9rem !important;
}

.vue-slider {
  margin-left: 4rem;
  margin-right: 6rem;
}

.vue-slider-dot-tooltip input {
  width: 4rem;
  height: 1.5rem;
  font-size: 0.8rem;
}
</style>
