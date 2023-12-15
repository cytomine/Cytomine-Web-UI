<template>
  <div>
    <button v-if="data.length === 0" class="button is-small" @click="searchSimilarAnnotations">
      {{ $t('search-similar-annotation') }}
    </button>
    <div v-else>
      <annotation-preview
        v-for="annotation in annotations"
        :annot="annotation"
        :key="annotation.id"
        :show-details="false"
        :show-image-info="false"
        :show-slice-info="false"
        :size="size"
      />
    </div>
  </div>
</template>

<script>
import AnnotationPreview from '@/components/annotations/AnnotationPreview.vue';
import constants from '@/utils/constants';

import {Annotation, Cytomine} from 'cytomine-client';

export default {
  name: 'similar-annotation',
  components: {
    AnnotationPreview,
  },
  props: {
    annotation: {type: Object},
    image: {type: Object},
    size: {type: Number, default: 64},
  },
  data() {
    return {
      data: [],
    };
  },
  computed: {
    annotations() {
      return this.data['filenames'].map(id => {
          return new Annotation({
            id: id,
            image: this.image.id,
            instanceFilename: id + '.png',
            url: `${constants.CYTOMINE_CORE_HOST}/api/annotation/${id}/crop.png`,
            cropURL: `${constants.CYTOMINE_CORE_HOST}/api/annotation/${id}/crop.png`
          });
        }
      );
    }
  },
  methods: {
    async searchSimilarAnnotations() {
      this.data = (await Cytomine.instance.api.get(
        'retrieval/retrieve.json',
        {params: {annotation: this.annotation.id, nrt_neigh: 10}}
      )).data;
    }
  }
};
</script>
