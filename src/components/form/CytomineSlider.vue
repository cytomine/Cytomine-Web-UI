<template>
<vue-slider
  :value="value" @input="$emit('input', $event)"
  :min="min"
  :max="max"
  :show="internalShow"
  :tooltip-dir="isArray ? ['left', 'right'] : 'right'"
  :debug="false"
  ref="slider"
>
  <template #tooltip="{index, value, merge}">
    <span v-if="!merge" class="vue-slider-tooltip" @mousedown.stop @click.stop="startEdition(index)">
      <template v-if="indexEdited !== (index || 0)">
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
    </span>
  </template>
</vue-slider>
</template>

<script>
import vueSlider from 'vue-slider-component';

export default {
  name: 'cytomine-slider',
  components: {vueSlider},
  props: {
    value: {type: null},
    min: {type: Number},
    max: {type: Number},
    show: {type: Boolean, default: true},
    integerOnly: {type: Boolean, default: true},
    revision: {type: Number} // change of this value will trigger a refresh
  },
  data() {
    return {
      indexEdited: null,
      internalShow: null,
      editedValue: 0
    };
  },
  computed: {
    isArray() {
      return Array.isArray(this.value);
    }
  },
  watch: {
    show(show) {
      this.internalShow = show;
    },
    revision() {
      this.$refs.slider.refresh();
    }
  },
  methods: {
    startEdition(index=0) {
      if(this.indexEdited !== index) {
        this.editedValue = this.isArray ? this.value[index] : this.value;
        this.indexEdited = index;
        this.refresh();
      }
    },
    stopEdition(index=0) {
      if(this.indexEdited === index) {
        let newValue = this.processInternalValue(index);
        this.$refs.slider.setValue(newValue);
        this.indexEdited = null;
        this.refresh();
      }
    },
    processInternalValue(index) {
      let newValue = this.isArray ? this.value.slice() : this.value;

      // if entered value is incorrect, reset to initial value
      if(!this.editedValue || isNaN(this.editedValue)) {
        return newValue;
      }

      let parsedValue = this.integerOnly ? parseInt(this.editedValue) : Number(this.editedValue);

      if(!this.isArray) {
        return parsedValue;
      }

      // reorder bounds if needed
      newValue[index] = parsedValue;
      if(newValue[0] > newValue[1]) {
        let tmp = newValue[0];
        newValue[0] = newValue[1];
        newValue[1] = tmp;
      }
      return newValue;
    },
    refresh() { // force re-render of vue-slider component to render changes in tooltip slot
      if(this.show) {
        this.internalShow = false;
        this.internalShow = true;
      }
    },
    focus() {
      this.$refs.inputSlider.focus();
    }
  },
  created() {
    this.internalShow = this.show;
  }
};
</script>

<style>
.vue-slider-component {
  flex: 1;
}

.vue-slider-component .vue-slider-tooltip {
  font-size: 0.9rem;
}

.vue-slider {
  margin-left: 4rem;
  margin-right: 6rem;
}

.vue-slider-tooltip input {
  width: 4rem;
  height: 1.4rem;
  font-size: 0.85rem;
}
</style>
