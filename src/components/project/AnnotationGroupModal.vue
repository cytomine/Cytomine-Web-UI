<template>
  <b-modal :active.sync="isActive">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Results from {{ group.name }}</p>
      </header>
      <section class="modal-card-body">
        <p>Results</p>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-link" @click="$emit('closeModal')">Close</button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    isActive: Boolean,
    group: Object,
  },
  name: 'AnnotationGroupModal',
};
</script>

<style scoped>

</style>
