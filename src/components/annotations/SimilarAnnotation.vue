<template>
  <div>
    <button class="button is-small" @click="searchSimilarAnnotations">
      {{ $t('search-similar-annotation') }}
    </button>
  </div>
</template>

<script>
import {Cytomine} from 'cytomine-client';

export default {
  name: 'similar-annotation',
  props: {
    annotation: Object,
  },
  methods: {
    async searchSimilarAnnotations() {
      let response = await Cytomine.instance.api.get(
        'retrieval/retrieve.json',
        {params: {annotation: this.annotation.id, nrt_neigh: 1}}
      );
    }
  }
};
</script>
