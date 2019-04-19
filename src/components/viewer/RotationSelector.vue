<template>
<div class="rotation-selector-wrapper" :class="{expanded}">
  <div class="ol-rotate ol-unselectable ol-control custom">
    <button type="button" @click="expanded = true">
      <span class="ol-compass" :style="{transform: `rotate(${rotation}rad)`}">⇧</span>
    </button>
  </div>
  <div v-show="expanded">
    <div class="top">
      <div class="rotation-controls">
        <b-field>
          <p class="control">
            <button class="button is-small" @click="degreesRotation = 0">{{$t('button-reset')}}</button>
          </p>
          <p class="control">
            <button class="button is-small" @click="increment(90)">+90°</button>
          </p>
          <p class="control">
            <button class="button is-small" @click="increment(-90)">-90°</button>
          </p>
        </b-field>
      </div>
      <button class="delete is-small" @click="expanded=false"></button>
    </div>
    <cytomine-slider v-model="degreesRotation" :max="360" :show="expanded" :revision="revisionSlider" />
  </div>
</div>
</template>

<script>
import CytomineSlider from '@/components/form/CytomineSlider';

export default {
  name: 'rotation-selector',
  components: {CytomineSlider},
  props: {
    index: Number
  },
  data() {
    return {
      expanded: false,
      revisionSlider: 0
    };
  },
  computed: {
    viewerModule() {
      return this.$store.getters.currentViewerModule;
    },
    imageWrapper() {
      return this.$store.getters.currentViewer.maps[this.index];
    },
    rotation() {
      return this.imageWrapper.rotation;
    },
    degreesRotation: {
      get() {
        return Math.round(this.rotation * 180 / Math.PI);
      },
      set(value) {
        this.$store.commit(this.viewerModule + 'setRotation', {
          index: this.index,
          rotation: Number(value) / 180 * Math.PI
        });
      }
    }
  },
  methods: {
    increment(inc) {
      this.degreesRotation = (this.degreesRotation + inc + 360) % 360;
    },
    updateMapSize() {
      this.revisionSlider++;
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
.rotation-selector-wrapper {
  border-radius: 2px;
  box-shadow: 0 0 1px #777;
  background: white;
  margin-left: 2px;
}

.rotation-selector-wrapper.expanded {
  min-width: 16.5em;
  padding-top: 0.4em;
  min-height: 6em;
}

.rotation-selector-wrapper.expanded .ol-control button {
  cursor: initial;
}

.rotation-selector-wrapper .ol-control {
  padding: 0;
}

.rotation-selector-wrapper.expanded .ol-control button {
  box-shadow: none;
}

.ol-rotate.ol-control {
  left: 0 !important;
  top: 0 !important;
}

.top {
  margin: 0em 0.4em 0.75em 1.8em;
  display: flex;
}

.top .rotation-controls {
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: 1em;
  margin-right: 1em;
  margin-top: 0.5em;
}
</style>

<style>
.rotation-selector-wrapper .vue-slider {
  margin-left: 1em;
  margin-right: 4em;
}
</style>
