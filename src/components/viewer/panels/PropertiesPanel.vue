<template>
<div class="properties-panel">
  <h1>{{$t('properties')}}</h1>
  <b-field horizontal :label="$t('key')">
    <b-select size="is-small" v-model="selectedPropertyKey">
      <option :value="null">
        {{$t('no-key-selected')}}
      </option>
      <option v-for="key in propertiesKeys" :value="key" :key="key">
        {{ key }}
      </option>
    </b-select>
  </b-field>

  <b-field horizontal :label="$t('color')">
    <b-select size="is-small" v-model="selectedPropertyColor">
      <option v-for="color in colors" :value="color" :key="color.name">
        {{ $t(color.name) }}
      </option>
    </b-select>
  </b-field>
</div>
</template>

<script>
import {defaultColors} from '@/utils/style-utils.js';

export default {
  name: 'properties-panel',
  props: {
    index: Number
  },
  computed: {
    colors() {
      return defaultColors;
    },
    viewerModule() {
      return this.$store.getters.currentViewerModule;
    },
    imageWrapper() {
      return this.$store.getters.currentViewer.maps[this.index];
    },
    selectedPropertyKey: {
      get() {
        return this.imageWrapper.selectedPropertyKey;
      },
      set(value) {
        this.$store.dispatch(this.viewerModule + 'setSelectedPropertyKey', {index: this.index, value});
      }
    },
    selectedPropertyColor: {
      get() {
        return this.imageWrapper.selectedPropertyColor;
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setSelectedPropertyColor', {index: this.index, value});
      }
    },
    propertiesKeys() {
      return this.imageWrapper.propertiesKeys;
    }
  }
};
</script>

<style>
.properties-panel select {
  width: 15em;
}
</style>
