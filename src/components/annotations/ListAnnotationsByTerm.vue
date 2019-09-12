<template>
<div class="box">
  <b-loading :is-full-page="false" class="small" :active="loading" v-if="!isInViewer" />
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
      v-for="annot in annotations" :key="((isInViewer) ? index : '') + title + annot.id"
      :annot="annot"
      :size="size"
      :color="color"
      :terms="allTerms"
      :users="allUsers"
      :images="allImages"
      :tracks="allTracks"
      :show-image-info="!isInViewer"
      @addTerm="$emit('addTerm', $event)"
      @addTrack="$emit('addTrack', $event)"
      @updateTermsOrTracks="$emit('updateTermsOrTracks', annot)"
      @updateProperties="$emit('updateProperties')"
      @centerView="$emit('centerView', annot)"
      @deletion="$emit('delete', annot)"
      @selectAnnotation="$emit('select', annot)"
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
    slicesIds: {type: Array, default: null},
    usersIds: Array,
    reviewed: Boolean,
    reviewUsersIds: {type: Array, default: null},
    afterThan: {type: Number, default: null},
    beforeThan: {type: Number, default: null},

    allTerms: Array,
    allUsers: Array,
    allImages: Array,
    allTracks: Array,

    revision: Number,
    visible: {type: Boolean, default: true},
    index: String
  },
  components: {AnnotationPreview},
  data() {
    return {
      loading: false,
      error: false,
      annotations: [],
      nbAnnotations: 0,
      pendingReload: true,
    };
  },
  computed: {
    collection() {
      this.revision; // to ensure that collection is reloaded if revision changes
      return new AnnotationCollection({
        images: this.imagesIds,
        slices: (this.isInViewer) ? this.slicesIds : null,
        term: this.multipleTerms || this.noTerm ? null : this.term.id,
        noTerm: this.noTerm,
        users: this.usersIds,
        reviewed: this.reviewed,
        reviewUsers: this.reviewUsersIds,
        multipleTerm: this.multipleTerms,
        showTerm: true,
        showGIS: true,
        showTrack: true,
        showWKT: this.isInViewer,
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
    isInViewer() {
      return (this.index !== undefined);
    },
    currentProject: get('currentProject/project'),
    projectModule() {
      return this.$store.getters['currentProject/currentProjectModule'];
    },
    imageModule() {
      return (this.isInViewer) ? this.$store.getters['currentProject/imageModule'](this.index) : null;
    },
    imageWrapper() {
      return (this.isInViewer) ? this.$store.getters['currentProject/currentViewer'].images[this.index] : null;
    },
    currentPage: {
      get() {
        if (this.isInViewer) {
          return this.imageWrapper.annotationsList.currentPage || 1;
        }
        return this.$store.state.projects[this.currentProject.id].listAnnotations.currentPages[this.term.id] || 1;
      },
      set(page) {
        if (this.isInViewer) {
          this.$store.commit(this.imageModule + 'setCurrentPage', page);
        }
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
    },
    visible() {
      if(this.pendingReload) {
        this.fetchPage();
      }
    },
  },
  methods: {
    async fetchPage() {
      if(!this.visible) { // prevent unnecessary reload if list not visible but schedule a reload at next opening
        this.pendingReload = true;
        return;
      }

      this.pendingReload = false;

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
