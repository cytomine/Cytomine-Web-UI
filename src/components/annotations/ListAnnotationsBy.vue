<template>
<div class="box">
  <b-loading :is-full-page="false" class="small" :active="loading"  />
  <div v-if="!isInViewer || (isInViewer && !loading)">
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
        :class="{active: isInViewer && annot.slice === imageWrapper.activeSlice.id}"
        :annot="annot"
        :size="size"
        :color="color"
        :terms="allTerms"
        :users="allUsers"
        :images="allImages"
        :tracks="allTracks"
        :show-image-info="!isInViewer"
        :show-slice-info="isByTrack && !noTrack"
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
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {fullName} from '@/utils/user-utils.js';

import AnnotationPreview from './AnnotationPreview';

import {AnnotationCollection} from 'cytomine-client';

export default {
  name: 'list-annotations-by',
  props: {
    categorization: String,
    nbPerPage: Number,
    size: Number,
    color: String,

    prop: Object,

    multipleTerms: Boolean,
    noTerm: Boolean,
    multipleTracks: Boolean,
    noTrack: Boolean,

    termsIds: Array,
    tracksIds: Array,
    imagesIds: Array,
    usersIds: Array,
    reviewed: Boolean,
    reviewUsersIds: {type: Array, default: null},
    afterThan: {type: Number, default: null},
    beforeThan: {type: Number, default: null},
    slicesIds: {type: Array, default: null},

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
      loading: true,
      error: false,
      annotations: [],
      nbAnnotations: 0,
      pendingReload: true,
      savedSlice: null
    };
  },
  computed: {
    isByTerm() {
      return this.categorization === 'TERM';
    },
    isByTrack() {
      return this.categorization === 'TRACK';
    },
    isByUser() {
      return this.categorization === 'USER';
    },
    isByImage() {
      return this.categorization === 'IMAGE';
    },

    collection() {
      this.revision; // to ensure that collection is reloaded if revision changes
      return new AnnotationCollection({
        slices: (this.isByTerm && this.isInViewer) ? this.slicesIds : null,

        term: (this.isByTerm && !this.multipleTerms && !this.noTerm) ? this.prop.id : null,
        track: (this.isByTrack && !this.multipleTracks && !this.noTrack) ? this.prop.id : null,
        user: (this.isByUser) ? this.prop.id : null,
        image: (this.isByImage) ? this.prop.id : null,

        noTerm: this.noTerm,
        multipleTerm: this.multipleTerms,
        noTrack: this.noTrack,
        multipleTrack: this.multipleTracks,

        terms: (!this.isByTerm) ? this.termsIds.filter(id => id > 0) : null,
        users: (!this.isByUser) ? this.usersIds : null,
        images: (!this.isByImage) ? this.imagesIds : null,
        tracks: (!this.isByTrack) ? this.tracksIds.filter(id => id > 0) : null,

        reviewed: this.reviewed,
        reviewUsers: (!this.isByUser) ? this.reviewUsersIds : null,
        showTerm: true,
        showGIS: true,
        showTrack: true,
        showWKT: this.isInViewer,
        showSlice: true,
        afterThan: this.afterThan,
        beforeThan: this.beforeThan,
        max: this.nbPerPage
      });
    },
    title() {
      if (this.isByUser) {
        return fullName(this.prop);
      }
      else if (this.isByImage) {
        return (this.prop.blindedName) ? this.prop.blindedName : this.prop.instanceFilename;
      }
      else if (this.isByTerm && this.multipleTerms) {
        return this.$t('multiple-terms');
      }
      else if (this.isByTerm && this.noTerm) {
        return this.$t('no-term');
      }
      else if (this.isByTrack && this.multipleTracks) {
        return this.$t('multiple-tracks');
      }
      else if (this.isByTrack && this.noTrack) {
        return this.$t('no-track');
      }
      else {
        return this.prop.name;
      }
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
        return this.$store.state.projects[this.currentProject.id].listAnnotations.currentPages[this.prop.id] || 1;
      },
      set(page) {
        if (this.isInViewer) {
          this.$store.commit(this.imageModule + 'setCurrentPage', page);
        }
        this.$store.commit(this.projectModule + 'listAnnotations/setCurrentPage', {prop: this.prop.id, page});
      }
    },
    activeSlice() {
      return (this.imageWrapper) ? this.imageWrapper.activeSlice : null;
    }
  },
  watch: {
    currentPage() {
      this.fetchPage();
    },
    collection(newCollection, oldCollection) {
      if (oldCollection && newCollection.track !== oldCollection.track) {
        this.initialize();
      }
      else {
        this.fetchPage();
      }
    },
    visible() {
      if(this.pendingReload) {
        this.fetchPage();
      }
    },
    activeSlice() {
      this.findPage();
    }
  },
  methods: {
    async initialize() {
      await this.findPage();
      await this.fetchPage(true);
    },
    async findPage() {
      if (this.isInViewer) {
        let countCollection = this.collection.clone();
        countCollection.beforeSlice = this.activeSlice.id;
        countCollection.max = 1;
        this.currentPage = Math.ceil(((await countCollection.fetchPage()).totalNbItems + 1)/ this.nbPerPage);
      }
    },
    async fetchPage(setLoading=false) {
      if(!this.visible) { // prevent unnecessary reload if list not visible but schedule a reload at next opening
        this.pendingReload = true;
        return;
      }

      this.pendingReload = false;

      if(!this.imagesIds.length || (!this.reviewed && !this.usersIds.length)
        || (this.reviewed && !this.reviewUsersIds.length) || !this.termsIds.length || !this.tracksIds.length) {
        this.annotations = [];
        this.nbAnnotations = 0;
        return;
      }

      if (setLoading)
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


  },
  async created() {
    this.initialize();
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

>>> .active .annot-preview {
  box-shadow: 0 2px 3px rgba(39, 120, 173, 0.75), 0 0 0 1px rgba(39, 120, 173, 0.75);
  font-weight: 600;
}
</style>
