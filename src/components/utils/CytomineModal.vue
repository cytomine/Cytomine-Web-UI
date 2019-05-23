<template>
<b-modal :active="active" @close="$emit('close')" has-modal-card>
  <cytomine-modal-card :title="title" @close="$emit('close', false)">
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
    title: String
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
