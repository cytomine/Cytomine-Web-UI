<template>
  <div
    :class="{ 'selected': isSelected }"
    @click="$emit('update:selected', annotation)"
  >
    <annotation-preview
      class="annotation-data"
      :annot="annotation"
      :images="images"
      :users="users"
      :size="85"
    />
  </div>
</template>

<script>
import AnnotationPreview from '@/components/annotations/AnnotationPreview';

export default {
  name: 'SelectableAnnotation',
  components: {
    AnnotationPreview,
  },
  props: {
    annotation: {type: Object, default: null},
    images: {type: Array, default: () => []},
    isSelected: {type: Boolean, default: false},
    users: {type: Array, default: () => []},
  }
};
</script>

<style scoped>
.selected {
  background-color: lightblue;
}
</style>
