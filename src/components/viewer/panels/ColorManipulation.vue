
<template>
<div class="color-manipulation">
  <h1>{{$t('colors')}}</h1>
  <table>
    <tr>
      <td>{{ $t('brightness') }}</td>
      <td>
        <cytomine-slider v-model="brightness" :min="-255" :max="255" :revision="revisionSliders" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('contrast') }}</td>
      <td>
        <cytomine-slider v-model="contrast" :min="-255" :max="255" :revision="revisionSliders" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('saturation') }}</td>
      <td>
        <cytomine-slider v-model="saturation" :min="-100" :max="100" :revision="revisionSliders" />
      </td>
    </tr>
    <tr>
      <td>{{ $t('hue') }}</td>
      <td>
        <cytomine-slider v-model="hue" :min="-180" :max="180" :revision="revisionSliders" />
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
  data() {
    return {
      revisionSliders: 0
    };
  },
  computed: {
    imageModule() {
      return this.$store.getters.imageModule(this.index);
    },
    imageWrapper() {
      return this.$store.getters.currentViewer.images[this.index];
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },

    brightness: {
      get() {
        return this.imageWrapper.colors.brightness;
      },
      set(value) {
        this.setBrightness(value);
      }
    },
    contrast: {
      get() {
        return this.imageWrapper.colors.contrast;
      },
      set(value) {
        this.setContrast(value);
      }
    },
    hue: {
      get() {
        return this.imageWrapper.colors.hue;
      },
      set(value) {
        this.setHue(value);
      }
    },
    saturation: {
      get() {
        return this.imageWrapper.colors.saturation;
      },
      set(value) {
        this.setSaturation(value);
      }
    }
  },
  watch: {
    activePanel(panel) {
      if(panel === 'colors') {
        this.revisionSliders++;
      }
    }
  },
  methods: {
    reset() {
      this.$store.commit(this.imageModule + 'resetColorManipulation');
    },

    setBrightness: _.debounce(function(value) {
      this.$store.commit(this.imageModule + 'setBrightness', value);
    }, debounceDelay),

    setContrast: _.debounce(function(value) {
      this.$store.commit(this.imageModule + 'setContrast', value);
    }, debounceDelay),

    setHue: _.debounce(function(value) {
      this.$store.commit(this.imageModule + 'setHue', value);
    }, debounceDelay),

    setSaturation: _.debounce(function(value) {
      this.$store.commit(this.imageModule + 'setSaturation', value);
    }, debounceDelay),

    updateMapSize() {
      this.revisionSliders++;
    }
  },
  mounted() {
    this.$eventBus.$on('updateMapSize', this.updateMapSize);
  },
  beforeDestroy() {
    this.$eventBus.$off('updateMapSize', this.updateMapSize);
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
