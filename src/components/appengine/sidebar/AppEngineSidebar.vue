<template>
  <div class="sidebar">
    <task-executor />
  </div>
</template>

<script>
import TaskExecutor from '@/components/appengine/sidebar/TaskExecutor.vue';

export default {
  name: 'appengine-sidebar',
  components: { TaskExecutor },
};
</script>

<style lang="scss" scoped>
.sidebar {
  background-color: white;
  height: 100%;
}

</style>