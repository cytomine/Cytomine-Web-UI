<template>
  <div>
    <i class="fa fa-circle color-preview" :style="{color}" />
    {{ name }}
  </div>
</template>

<script>
export default {
  name: 'ChannelHistogramName',
  props: {
    histogram: Object
  },
  computed: {
    channelIndex() {
      return this.histogram.channel;
    },
    color() {
      return (this.histogram.color) ? this.histogram.color : '#C0C0C0';
    },
    name() {
      //TODO: get channel name
      return `${this.$t('sample-histogram-abbr')} ${this.channelIndex}`;
    },
  }
};
</script>

<style scoped>
.color-preview {
  margin-right: 0.25em;
}
</style>
