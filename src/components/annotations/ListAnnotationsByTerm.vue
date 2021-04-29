<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


<template>
<div class="box">
  <b-loading :is-full-page="false" class="small" :active="loading" />
  <h2> {{ title }} ({{nbAnnotations}}) </h2>
  <template v-if="error">
    <b-message type="is-danger" has-icon icon-size="is-small">
      {{$t('failed-fetch-annots')}}
    </b-message>
  </template>
  <template v-else-if="!annotations.length">
    <em class="no-result">{{ $t('no-annotation') }}</em>
  </template>
  <template v-else>
    <annotation-preview
      v-for="annot in annotations" :key="title + annot.id"
      :annot="annot"
      :size="size"
      :color="color"
      :terms="allTerms"
      :users="allUsers"
      :images="allImages"
      @addTerm="$emit('addTerm', $event)"
      @update="$emit('update', annot.id)"
    />

    <b-pagination
      :total="nbAnnotations"
      :current.sync="currentPage"
      size="is-small"
      :per-page="nbPerPage"
    />
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import AnnotationPreview from './AnnotationPreview';

import {AnnotationCollection} from 'cytomine-client';

export default {
  name: 'list-annotations-by-term',
  props: {
    nbPerPage: Number,
    size: Number,
    color: String,

    term: Object,
    multipleTerms: Boolean,
    noTerm: Boolean,
    imagesIds: Array,
    usersIds: Array,
    tagsIds: Array,
    noTag: Boolean,
    reviewed: Boolean,
    reviewUsersIds: Array,
    afterThan: Number,
    beforeThan: Number,

    allTerms: Array,
    allUsers: Array,
    allImages: Array,

    revision: Number
  },
  components: {AnnotationPreview},
  data() {
    return {
      loading: false,
      error: false,
      annotations: [],
      nbAnnotations: 0,
      openedAnnot: 0
    };
  },
  computed: {
    collection() {
      this.revision; // to ensure that collection is reloaded if revision changes
      return new AnnotationCollection({
        images: this.imagesIds,
        term: this.multipleTerms || this.noTerm ? null : this.term.id,
        noTerm: this.noTerm,
        users: this.usersIds,
        reviewed: this.reviewed,
        reviewUsers: this.reviewUsersIds,
        tags: this.tagsIds,
        noTag: this.noTag,
        multipleTerm: this.multipleTerms,
        showTerm: true,
        showGIS: true,
        afterThan: this.afterThan,
        beforeThan: this.beforeThan,
        max: this.nbPerPage
      });
    },
    title() {
      if(this.multipleTerms) {
        return this.$t('multiple-terms');
      }
      if(this.noTerm) {
        return this.$t('no-term');
      }
      return this.term.name;
    },
    currentProject: get('currentProject/project'),
    projectModule() {
      return this.$store.getters['currentProject/currentProjectModule'];
    },
    currentPage: {
      get() {
        return this.$store.state.projects[this.currentProject.id].listAnnotations.currentPages[this.term.id] || 1;
      },
      set(page) {
        this.$store.commit(this.projectModule + 'listAnnotations/setCurrentPage', {term: this.term.id, page});
      }
    }
  },
  watch: {
    currentPage() {
      this.fetchPage();
    },
    collection() {
      this.fetchPage();
    }
  },
  methods: {
    async fetchPage() {
      if(!this.imagesIds.length || (!this.reviewed && !this.usersIds.length)
                    || (this.reviewed && !this.reviewUsersIds.length)) {
        this.annotations = [];
        this.nbAnnotations = 0;
        return;
      }

      this.loading = true;

      try {
        let data = await this.collection.fetchPage(this.currentPage - 1);
        this.annotations = data.array;
        this.nbAnnotations = data.totalNbItems;

        // if openedAnnot no longer in collection (can happen if term was removed from annotation),
        // reset openedAnnot value (otherwise, if annot added again to collection, popover reopens)
        if(!this.annotations.map(annot => annot.id).includes(this.openedAnnot)) {
          this.openedAnnot = 0;
        }
      }
      catch(error) {
        if(this.currentPage > 1) { // error may be due to the page number (not enough annots) => retry on first page
          this.currentPage = 1;
          return;
        }

        console.log(error);
        this.nbAnnotations = 0;
        this.error = true;
      }
      this.loading = false;
    },
    viewAnnot(annot) {
      this.$router.push(`/project/${annot.project}/image/${annot.image}/annotation/${annot.id}`);
    },

  },
  created() {
    this.fetchPage();
  }
};
</script>

<style scoped>
.box {
  position: relative;
}

.no-result {
  color: grey;
}

>>> ul.pagination-list {
  justify-content: flex-end;
}
</style>
