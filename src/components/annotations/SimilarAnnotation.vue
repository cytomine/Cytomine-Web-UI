<template>
  <div>
    similar annotation
  </div>
</template>

<script>
export default {
  name: 'similar-annotation',
  props: {
    annotation: Object,
  },
  created() {
    console.log(this.annotation);
  }
};
</script>
