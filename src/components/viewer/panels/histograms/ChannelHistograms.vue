<template>
  <b-tabs type="is-boxed" class="histogram" size="is-small">
    <template v-for="histogram in filteredHistograms">
      <b-tab-item :key="tabKey(histogram)">
        <template #header>
          <channel-name :channel="channels[histogram.channel]" />
        </template>
        <channel-histogram
          :index="index"
          :histogram="histogram"
          :log-scale="logScale"
          :revision="revision"
          :gamma="gamma"
          :inverse="inverse"
        />
      </b-tab-item>
    </template>
  </b-tabs>
</template>

<script>
import ChannelHistogram from '@/components/viewer/panels/histograms/ChannelHistogram';
import ChannelName from '@/components/viewer/ChannelName';

export default {
  name: 'ChannelHistograms',
  components: {ChannelName, ChannelHistogram},
  props: {
    index: String,

    histograms: Array,
    logScale: Boolean,
    revision: Number,
    gamma: Number,
    inverse: Boolean,
  },
  computed: {
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    channels() {
      return this.$store.getters[this.imageModule + 'extrinsicChannels'];
    },
    sliceChannels() {
      return this.imageWrapper.activeSlices.map(slice => slice.channel);
    },
    filteredHistograms() {
      if (this.image.extrinsicChannels > 1 && this.image.channels !== this.image.extrinsicChannels) {
        return this.histograms;
      }
      return this.histograms.filter(h => this.sliceChannels.includes(h.channel));
    }
  },
  methods: {
    tabKey(histogram) {
      return `${this.image.id}-${this.index}-histogram-${histogram.channel}`;
    }
  }
};
</script>

<style scoped>

>>> .tab-content {
  background-color: white;
  border: 1px solid #DBDBDB;
  border-top: none;
  border-radius: 0 0 4px 4px;
  min-height: 5em;
  padding: 0.5rem !important;
}

>>> .b-tabs:not(:last-child) {
  margin-bottom: 1em;
}

.histogram {
  min-height: 3em;
}
</style>
