<template>
  <span v-if="channel">
    <i class="fa fa-circle color-preview" :style="{color}" />
    {{ name }}
  </span>
</template>

<script>
export default {
  name: 'ChannelName',
  props: {
    channel: Object
  },
  computed: {
    channelIndex() {
      return this.channel.channel || this.channel.index;
    },
    color() {
      return (this.channel.color) ? this.channel.color : '#C0C0C0';
    },
    name() {
      if (this.channel.name) {
        return this.channel.name;
      }
      return `${this.$t('channel-abbr')} ${this.channelIndex}`;
    },
  }
};
</script>

<style scoped>
.color-preview {
  margin-right: 0.25em;
}
</style>
