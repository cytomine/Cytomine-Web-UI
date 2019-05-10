<template>
<span v-if="term">
  <div class="color-preview" v-if="term.color" :style="{background: term.color}"></div>
  {{term.name}}
</span>
</template>

<script>
export default {
  name: 'cytomine-term',
  props: {
    term: Object
  }
};
</script>

<style scoped>
.color-preview {
  width: 1em;
  height: 1em;
  display: inline-block;
  margin-right: 0.25em;
  border-radius: 0.25em;
  box-shadow: 0 0 1px #777;
  position: relative;
  top: 0.2em;
}
</style>
