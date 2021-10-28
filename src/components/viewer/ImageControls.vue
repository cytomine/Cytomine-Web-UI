<template>
  <div class="image-controls-container" v-if="isImageMultidimensional">

    <!-- ----- CHANNELS ----- -->
    <div class="image-dimension" v-if="hasChannels">
      <strong class="image-dimension-name">C</strong>
      <template v-if="areChannelsMergeable">
        <b-select v-model="currentChannel" size="is-small" class="channel-selector" expanded>
          <option v-for="channel in channels" :key="channel.name" :value="channel.index">
            {{channel.name}}
          </option>
        </b-select>

      </template>
      <template v-else>
        <image-controls-shift-buttons
          :index="index"
          :forward="false"
          :current="currentSlice.channel"
          :size="image.channels"
          dimension="channel"
          @shift="shift('channel', $event)"
        />

        <cytomine-slider
          v-model="currentChannel"
          :max="image.channels - 1"
          :integer-only="true"
          class="image-dimension-slider"
        >
          <template v-if="hasChannelName" #default="{ value }">
            {{channelValue(value) || "?"}}
          </template>
        </cytomine-slider>

        <image-controls-shift-buttons
          :index="index"
          :forward="true"
          :current="currentSlice.channel"
          :size="image.channels"
          dimension="channel"
          @shift="shift('channel', $event)"
        />
      </template>
    </div>


    <!-- ----- DEPTH ----- -->
    <div class="image-dimension" v-if="hasDepth">
      <strong class="image-dimension-name">Z</strong>
      <image-controls-shift-buttons
          :index="index"
          :forward="false"
          :current="currentSlice.zStack"
          :size="image.depth"
          dimension="zStack"
          @shift="shift('zStack', $event)"
      />

      <cytomine-slider
        v-model="currentZStack"
        :max="image.depth - 1"
        :integer-only="true"
        class="image-dimension-slider" />

      <image-controls-shift-buttons
          :index="index"
          :forward="true"
          :current="currentSlice.zStack"
          :size="image.depth"
          dimension="zStack"
          @shift="shift('zStack', $event)"
      />
    </div>



    <!-- ----- DURATION ----- -->
    <div class="image-dimension" v-if="hasDuration">
      <strong class="image-dimension-name">T</strong>
      <image-controls-shift-buttons
          :index="index"
          :forward="false"
          :current="currentSlice.time"
          :size="image.duration"
          dimension="time"
          @shift="shift('time', $event)"
      />

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

      <image-controls-shift-buttons
          :index="index"
          :forward="true"
          :current="currentSlice.time"
          :size="image.duration"
          dimension="time"
          @shift="shift('time', $event)"
      />
    </div>
  </div>
</template>

<script>
import CytomineSlider from '@/components/form/CytomineSlider';
import ImageControlsShiftButtons from '@/components/viewer/ImageControlsShiftButtons';

import {formatMinutesSeconds} from '@/utils/slice-utils.js';
import {slicePositionToRank} from '@/utils/slice-utils';
import constants from '@/utils/constants';

export default {
  name: 'image-controls',
  components: {ImageControlsShiftButtons, CytomineSlider},
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
    },
    sliceInstances() {
      return this.imageWrapper.sliceInstances;
    },
    hasChannelName() {
      return this.currentSlice.channelName !== null;
    },
    areChannelsMergeable() {
      return this.image.extrinsicChannels <= constants.MAX_MERGEABLE_CHANNELS;
    },
    channels() {
      return [...Array(this.image.extrinsicChannels).keys()].map(index => (
        {index, name: this.channelValue(index)}
      ));
    }
  },
  methods: {
    formatMinutesSeconds(time) {
      return formatMinutesSeconds(time);
    },
    channelValue(channel) {
      let slice = null;
      if (channel === this.currentChannel) {
        slice = this.currentSlice;
      }
      else {
        let rank = slicePositionToRank({channel, zStack: this.currentZStack, time: this.currentTime}, this.image);
        slice = this.sliceInstances[rank];
      }
      return (slice) ? slice.channelName : null;
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

.image-dimension-slider {
  flex-grow: 3;
}

.channel-selector {
  width: 100%;
}

</style>

<style>
.image-dimension .vue-slider {
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
