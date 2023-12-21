<template>
  <div class="similar-annotations-playground">
    <vue-draggable-resizable
      class="draggable"
      :parent="false"
      :resizable="false"
      :x="350"
      :y="0"
      :h="'auto'"
      :w="450"
    >
      <div class="actions">
        <h1>Similar annotations</h1>

        <button class="button is-small close" @click="hideSimilarAnnotations()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="annotation-content">
        <div class="annotation-data" v-for="data in similarities" :key="data.annotation.id">
          <annotation-preview
            :annot="data.annotation"
            :key="data.annotation.id"
            :same-view-on-click="true"
            :show-details="false"
            :show-image-info="false"
            :show-slice-info="false"
            :size="size"
            @select="$emit('select', $event)"
          />

          <div>
            {{ data.distance.toFixed(2) }}
          </div>
        </div>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import AnnotationPreview from '@/components/annotations/AnnotationPreview.vue';
import constants from '@/utils/constants';

import {Annotation} from 'cytomine-client';
import VueDraggableResizable from 'vue-draggable-resizable';

export default {
  name: 'similar-annotation',
  components: {
    AnnotationPreview,
    VueDraggableResizable
  },
  props: {
    data: {type: Object},
    image: {type: Object},
    size: {type: Number, default: 64},
  },
  computed: {
    similarities() {
      let similarities = [];

      for (let i = 0; i < this.data['filenames'].length; i++) {
        let id = this.data['filenames'][i];
        similarities.push({
          annotation: new Annotation({
            id: id,
            image: this.image.id,
            instanceFilename: this.image.instanceFilename,
            url: `${constants.CYTOMINE_CORE_HOST}/api/annotation/${id}/crop.png`,
            cropURL: `${constants.CYTOMINE_CORE_HOST}/api/annotation/${id}/crop.png`
          }),
          distance: this.data['distances'][i]
        });
      }

      return similarities;
    }
  },
  methods: {
    hideSimilarAnnotations() {
      this.$eventBus.$emit('hide-similar-annotations');
    }
  }
};
</script>

<style scoped>

.actions {
  align-items: center;
  background-color: #e5e5e5;
  border-bottom: 1px solid #b5b5b5;
  border-radius: 5px 5px 0 0;
  display: flex;
  padding: 0.35em;
  text-align: right;
}

.actions .button {
  margin-left: 0.25rem;
  width: 1.75rem;
}

.annotation-content {
  display: flex;
  flex-wrap: wrap;
}

.annotation-data {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.draggable {
  background: #f2f2f2;
  border-radius: 5px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

h1 {
  flex: 1;
  font-size: 1rem;
  margin-left: 0.4em;
  padding: 0;
  text-align: left;
}

.similar-annotations-playground {
  top: 3.5rem;
  bottom: 2em;
  left: 3.5rem;
  right: 4.5rem;
  pointer-events: none;
  position: absolute;
}
</style>

<style>
.similar-annotations-playground .draggable {
  z-index: 20 !important;
}
</style>
