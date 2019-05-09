
<template>
<div class="color-manipulation">
  <h1>{{$t('colors')}}</h1>
  <table>
    <tr>
      <td>{{ $t('brightness') }}</td>
      <td>
        <cytomine-slider v-model="brightness" :min="-255" :max="255" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('contrast') }}</td>
      <td>
        <cytomine-slider v-model="contrast" :min="-255" :max="255" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('saturation') }}</td>
      <td>
        <cytomine-slider v-model="saturation" :min="-100" :max="100" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('hue') }}</td>
      <td>
        <cytomine-slider v-model="hue" :min="-180" :max="180" />
      </td>
    </tr>
  </table>
  <div class="actions">
    <button class="button is-small" @click="reset()">{{$t('button-reset')}}</button>
  </div>
</div>
</template>

<script>
import _ from 'lodash';
import CytomineSlider from '@/components/form/CytomineSlider';

const debounceDelay = 500;

export default {
  name: 'color-manipulation',
  components: {CytomineSlider},
  props: {
    index: String
  },
  computed: {
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },

    brightness: {
      get() {
        return this.imageWrapper.colors.brightness;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setBrightness', value);
      }
    },
    contrast: {
      get() {
        return this.imageWrapper.colors.contrast;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setContrast', value);
      }
    },
    hue: {
      get() {
        return this.imageWrapper.colors.hue;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setHue', value);
      }
    },
    saturation: {
      get() {
        return this.imageWrapper.colors.saturation;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setSaturation', value);
      }
    }
  },
  methods: {
    reset() {
      this.$store.commit(this.imageModule + 'resetColorManipulation');
    }
  }
};
</script>

<style scoped>
td, tr {
  vertical-align: middle !important;
}

td:first-child {
  font-weight: 600;
  text-align: right;
  padding: 0.35em 0.5em;
}

td:last-child {
  width: 100%;
}

.actions {
  margin-top: 1em;
  text-align: right;
}

>>> .vue-slider {
  margin-left: 0.4em;
  margin-right: 4em;
}
</style>
