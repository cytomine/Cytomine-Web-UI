<template>
  <div class="image-controls-container" v-if="isImageMultidimensional">

    <!-- ----- CHANNELS ----- -->
    <div class="image-dimension" v-if="hasChannels">
      <strong class="image-dimension-name">C</strong>
      <div class="buttons has-addons">
        <button
          class="button is-small item"
          :disabled="!canShiftBackward('channel')"
          @click="shift('channel', -Math.min(step, currentSlice.channel))"
        >
          <i class="fas fa-fast-backward"></i>
          <div class="step-counter">-{{step}}</div>
        </button>
        <button
          class="button is-small item"
          :disabled="!canShiftBackward('channel')"
          @click="shift('channel', -1)"
        >
          <i class="fas fa-step-backward"></i>
        </button>
      </div>

      <cytomine-slider
        v-model="currentChannel"
        :max="image.channels - 1"
        :integer-only="true"
        class="image-dimension-slider" />

      <div class="buttons has-addons">
        <button
          class="button is-small item"
          :disabled="!canShiftForward('channel')"
          @click="shift('channel', 1)"
        >
          <i class="fas fa-step-forward"></i>
        </button>
        <button
          class="button is-small item"
          :disabled="!canShiftForward('channel')"
          @click="shift('channel', Math.min(step, image.channels - currentSlice.channel - 1))"
        >
          <i class="fas fa-fast-forward"></i>
          <div class="step-counter">+{{step}}</div>
        </button>
      </div>
    </div>


    <!-- ----- DEPTH ----- -->
    <div class="image-dimension" v-if="hasDepth">
      <strong class="image-dimension-name">Z</strong>
      <div class="buttons has-addons">
        <button
          class="button is-small"
          :disabled="!canShiftBackward('zStack')"
          @click="shift('zStack', -Math.min(step, currentSlice.zStack))"
        >
          <i class="fas fa-fast-backward"></i>
          <div class="step-counter">-{{step}}</div>
        </button>

        <button
          class="button is-small"
          :disabled="!canShiftBackward('zStack')"
          @click="shift('zStack', -1)"
        >
          <i class="fas fa-step-backward"></i>
        </button>
      </div>

      <cytomine-slider
        v-model="currentZStack"
        :max="image.depth - 1"
        :integer-only="true"
        class="image-dimension-slider" />

      <div class="buttons has-addons">
        <button
          class="button is-small"
          :disabled="!canShiftForward('zStack')"
          @click="shift('zStack', 1)"
        >
          <i class="fas fa-step-forward"></i>
        </button>
        <button
          class="button is-small"
          :disabled="!canShiftForward('zStack')"
          @click="shift('zStack', Math.min(step, image.depth - currentSlice.zStack - 1))"
        >
          <i class="fas fa-fast-forward"></i>
          <div class="step-counter">+{{step}}</div>
        </button>
      </div>
    </div>



    <!-- ----- DURATION ----- -->
    <div class="image-dimension" v-if="hasDuration">
      <strong class="image-dimension-name">T</strong>

      <div class="buttons has-addons">
        <button
          class="button is-small"
          :disabled="!canShiftBackward('time')"
          @click="shift('time', -Math.min(step, currentSlice.time))"
        >
          <i class="fas fa-fast-backward"></i>
          <div class="step-counter">-{{step}}</div>
        </button>
        <button
          class="button is-small"
          :disabled="!canShiftBackward('time')"
          @click="shift('time', -1)"
        >
          <i class="fas fa-step-backward"></i>
        </button>
      </div>

<!--      <div class="buttons has-addons">-->
<!--        <button class="button is-small">-->
<!--          <i class="fas fa-play"></i>-->
<!--        </button>-->
<!--      </div>-->

      <cytomine-slider
        v-model="currentTime"
        :max="image.duration - 1"
        :integer-only="true"
        class="image-dimension-slider"
      >
        <template v-if="image.fps" #default="{ value }">
          {{formatMinutesSeconds(value / image.fps)}} | {{value}}
        </template>
      </cytomine-slider>

      <div class="buttons has-addons">
        <button
          class="button is-small"
          :disabled="!canShiftForward('time')"
          @click="shift('time', 1)"
        >
          <i class="fas fa-step-forward"></i>
        </button>
        <button
          class="button is-small"
          :disabled="!canShiftForward('time')"
          @click="shift('time', Math.min(step, image.duration - currentSlice.time - 1))"
        >
          <i class="fas fa-fast-forward"></i>
          <div class="step-counter">+{{step}}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import CytomineSlider from '@/components/form/CytomineSlider';

import {formatMinutesSeconds} from '@/utils/slice-utils.js';

export default {
  name: 'image-controls',
  components: {CytomineSlider},
  data() {
    return {
      step: 2, // TODO: add into configuration
    };
  },
  props: {
    index: String
  },
  computed: {
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    imageWrapper() {
      return this.viewerWrapper.images[this.index];
    },
    isActiveImage() {
      return this.viewerWrapper.activeImage === this.index;
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    currentSlice() {
      return this.imageWrapper.activeSlice;
    },
    nbSlices() {
      return this.image.depth * this.image.duration * this.image.channels;
    },
    currentChannel: {
      get() {
        return this.currentSlice.channel;
      },
      async set(value) {
        await this.seek(value, this.currentSlice.zStack, this.currentSlice.time);
      }
    },
    currentZStack: {
      get() {
        return this.currentSlice.zStack;
      },
      async set(value) {
        await this.seek(this.currentSlice.channel, value, this.currentSlice.time);
      }
    },
    currentTime: {
      get() {
        return this.currentSlice.time;
      },
      async set(value) {
        await this.seek(this.currentSlice.channel, this.currentSlice.zStack, value);
      }
    },
    hasChannels() {
      return this.image.channels > 1;
    },
    hasDepth() {
      return this.image.depth > 1;
    },
    hasDuration() {
      return this.image.duration > 1;
    },
    isImageMultidimensional() {
      return this.hasChannels || this.hasDuration || this.hasDepth;
    }

  },
  methods: {
    formatMinutesSeconds(time) {
      return formatMinutesSeconds(time);
    },

    async goToRank(rank) {
      await this.$store.dispatch(this.imageModule + 'setActiveSliceByRank', rank);
      this.$eventBus.$emit('reloadAnnotations', {idImage: this.image.id});
    },
    async seek(channel, zStack, time) {
      await this.$store.dispatch(this.imageModule + 'setActiveSliceByPosition', {time, channel, zStack});
      this.$eventBus.$emit('reloadAnnotations', {idImage: this.image.id});
    },
    async shift(dimension, increment) {
      let time = (dimension === 'time') ? this.currentSlice.time + increment : this.currentSlice.time;
      let channel = (dimension === 'channel') ? this.currentSlice.channel + increment : this.currentSlice.channel;
      let zStack = (dimension === 'zStack') ? this.currentSlice.zStack + increment : this.currentSlice.zStack;
      await this.seek(channel, zStack, time);
    },
    canShiftForward(dimension) {
      switch (dimension) {
        case 'channel':
          return this.currentSlice.channel < this.image.channels - 1;
        case 'time':
          return this.currentSlice.time < this.image.duration - 1;
        case 'zStack':
          return this.currentSlice.zStack < this.image.depth - 1;
        case 'rank':
          return this.currentSlice.rank < this.nbSlices - 1;
      }
    },
    canShiftBackward(dimension) {
      switch (dimension) {
        case 'channel':
          return this.currentSlice.channel >= 1;
        case 'time':
          return this.currentSlice.time >= 1;
        case 'zStack':
          return this.currentSlice.zStack >= 1;
        case 'rank':
          return this.currentSlice.rank >= 1;
      }
    },

    async shortkeyHandler(key) {
      if (!this.isActiveImage) {
        return;
      }

      switch (key) {
        case 'nav-next-t':
          if (this.canShiftForward('time')) {
            await this.shift('time', 1);
          }
          return;
        case 'nav-previous-t':
          if (this.canShiftBackward('time')) {
            await this.shift('time', -1);
          }
          return;
        case 'nav-first-t':
          this.currentTime = 0;
          return;
        case 'nav-last-t':
          this.currentTime = this.image.duration - 1;
          return;
        case 'nav-next-z':
          if (this.canShiftForward('zStack')) {
            this.currentZStack++;
          }
          return;
        case 'nav-previous-z':
          if (this.canShiftBackward('zStack')) {
            this.currentZStack--;
          }
          return;
        case 'nav-first-z':
          this.currentZStack = 0;
          return;
        case 'nav-last-z':
          this.currentZStack = this.image.depth - 1;
          return;
        case 'nav-next-c':
          if (this.canShiftForward('channel')) {
            this.currentChannel++;
          }
          return;
        case 'nav-previous-c':
          if (this.canShiftBackward('channel')) {
            this.currentChannel--;
          }
          return;
        case 'nav-first-c':
          this.currentChannel = 0;
          return;
        case 'nav-last-c':
          this.currentChannel = this.image.channels - 1;
          return;
        case 'nav-next-slice':
          if (this.canShiftForward('rank')) {
            await this.goToRank(this.currentSlice.rank + 1);
          }
          return;
        case 'nav-previous-slice':
          if (this.canShiftBackward('rank')) {
            await this.goToRank(this.currentSlice.rank - 1);
          }
          return;
        case 'nav-first-slice':
          await this.seek(0, 0, 0);
          return;
        case 'nav-last-slice':
          await this.seek(this.image.channels - 1, this.image.depth - 1, this.image.duration - 1);
          return;
      }
    }
  },
  mounted() {
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style lang="scss" scoped>
.image-controls-container {
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 1px #777;
  background: white;
  display: flex;
  flex-direction: column;
}

.image-dimension {
  display: flex;
  align-items: center;
}

.image-dimension-name {
  padding-right: 0.5rem;
  width: 1rem;
}

.buttons {
  float:left;
  margin: 1px;
  margin-bottom: 0 !important;

  .button {
    margin-bottom: 0;
  }
}

.image-dimension-slider {
  flex-grow: 3;
}

.step-counter {
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  font-size: 0.7em;
  font-weight: 600;
  text-align:right;
  line-height: 0.9em;
}

</style>

<style>
.image-dimension .vue-slider {
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
