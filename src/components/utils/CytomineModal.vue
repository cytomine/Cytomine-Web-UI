<template>
<b-modal :active="active" @close="close()" :can-cancel="canCancel" has-modal-card>
  <cytomine-modal-card :title="title" @close="close()">
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </cytomine-modal-card>
</b-modal>
</template>

<script>
import CytomineModalCard from './CytomineModalCard';

export default {
  name: 'cytomine-modal',
  props: {
    active: Boolean,
    title: String,
    canCancel: Boolean
  },
  components: {CytomineModalCard},
  methods: {
    close() {
      this.$emit('close');
      this.$emit('update:active', false);
    }
  }
};
</script>
