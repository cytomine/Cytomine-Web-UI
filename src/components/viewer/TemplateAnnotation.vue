<template>
  <div class="content-wrapper template-container">
    <div class="panel-heading">
      <h1>Previously selected area</h1>
    </div>
  <div class="panel-block">
    <div>
      <img :src="imageURL" alt="template-image" />
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'TemplateAnnotation',
  props: {
    projectId: String,
  },
  computed: {
    imageURL() {
      return `http://core.jepat.jenslien.net/api/userannotation/${this.annotationID}/crop.jpg?maxSize=400&complete=true&thickness=2&increaseArea=1.45&draw=false&color=0x009BCC`;
    },
    annotationID() {
      return this.$store.state.projects[this.projectId].analysis.annotationsAddedForAnalysis[0];
    },
  },
};
</script>

<style scoped>
.template-container {
  pointer-events: none;
  position: absolute;
  top: 1rem;
  right: 1.5rem;
}

h1 {
  font-size: 18px;
  margin: 0;
  padding: 0;
}
</style>
