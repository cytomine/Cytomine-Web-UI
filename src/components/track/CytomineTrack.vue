<template>
<span v-if="track">
  <i class="far fa-square color-preview" v-if="track.color" :style="{color: track.color}"></i>
  {{track.name}}
</span>
</template>

<script>
export default {
  name: 'cytomine-track',
  props: {
    track: Object
  }
};
</script>

<style scoped>
  .color-preview {
    margin-right: 0.25em;
  }
</style>
