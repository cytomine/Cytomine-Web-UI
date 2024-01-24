<template>
  <div class="sidebar">
    <application-executor />
  </div>
</template>

<script>
import ApplicationExecutor from './ApplicationExecutor.vue';

export default {
  name: 'appengine-sidebar',
  components: { ApplicationExecutor },
};
</script>

<style lang="scss" scoped>
.sidebar {
  background-color: white;
  height: 100%;
}

</style>