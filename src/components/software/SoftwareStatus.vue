<template>
<span class="tag" :class="tagClass">
  {{$t(label)}}
</span>
</template>

<script>
export default {
  name: 'software-status',
  props: {
    software: Object
  },
  computed: {
    tagClass() {
      if(!this.software.softwareVersion) {
        return 'is-white';
      }
      if(this.software.deprecated) {
        return 'is-dark';
      }
      return 'is-info';
    },
    label() {
      if(!this.software.softwareVersion) {
        return 'no-info';
      }
      if(this.software.deprecated) {
        return 'deprecated';
      }
      return 'last-release';
    }
  }
};
</script>

<style scoped>

</style>
