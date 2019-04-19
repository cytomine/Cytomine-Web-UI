<template>
<div>
  <h1>{{$t('digital-zoom')}}</h1>
  <b-checkbox v-model="digitalZoom">
    {{$t('digital-zoom-checkbox-label')}}
  </b-checkbox>
</div>
</template>

<script>
import constants from '@/utils/constants';

export default {
  name: 'digital-zoom',
  props: {
    index: Number
  },
  computed: {
    viewerModule() {
      return this.$store.getters.currentViewerModule;
    },
    imageWrapper() {
      return this.$store.getters.currentViewer.maps[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },

    digitalZoom: {
      get() {
        return this.imageWrapper.digitalZoom;
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setDigitalZoom', {
          index: this.index,
          digitalZoom: Boolean(value)
        });
      }
    },

    maxZoom: {
      get() {
        return this.imageWrapper.maxZoom;
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setMaxZoom', {
          index: this.index,
          maxZoom: Number(value)
        });
      }
    },
  },
  watch: {
    digitalZoom() {
      let increment = this.digitalZoom ? constants.DIGITAL_ZOOM_INCREMENT : 0;
      this.maxZoom = this.image.depth + increment;
    }
  }
};
</script>
