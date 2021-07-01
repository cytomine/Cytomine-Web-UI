<template>
  <b-tabs type="is-boxed" class="histogram" size="is-small">
    <b-tab-item v-for="histogram in histograms" :key="tabKey(histogram)">
      <template #header>
        <channel-histogram-name :histogram="histogram" />
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
  </b-tabs>
</template>

<script>
import ChannelHistogram from '@/components/viewer/panels/histograms/ChannelHistogram';
import ChannelHistogramName from '@/components/viewer/panels/histograms/ChannelHistogramName';

export default {
  name: 'ChannelHistograms',
  components: {ChannelHistogramName, ChannelHistogram},
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
    image() {
      return this.imageWrapper.imageInstance;
    },
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
