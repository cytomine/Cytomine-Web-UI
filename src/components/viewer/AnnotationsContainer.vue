<template>
  <div>
    <annotation-details-container
      v-if="isPanelDisplayed('annotation-main')"
      :index="index"
      :view="view"
      @centerView="centerViewOnAnnot"
      @addTerm="addTerm"
      @addTrack="addTrack"
      @updateTermsOrTracks="updateTermsOrTracks"
      @updateProperties="updateProperties"
      @delete="handleDeletion"
    />
    <annotations-list
      class="annotations-table-wrapper"
      :index="index"
      :view="view"
      @centerView="centerViewOnAnnot"
      @addTerm="addTerm"
      @addTrack="addTrack"
      @updateTermsOrTracks="updateTermsOrTracks"
      @updateProperties="updateProperties"
      @delete="handleDeletion"
    />
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {Action, updateTermProperties, updateTrackProperties} from '@/utils/annotation-utils.js';

import WKT from 'ol/format/WKT';

import AnnotationsList from './AnnotationsList';
import AnnotationDetailsContainer from './AnnotationDetailsContainer';

export default {
  name: 'AnnotationsContainer',
  props: {
    index: String,
    view: Object
  },
  data() {
    return {
      format: new WKT(),
    };
  },
  components: {
    AnnotationsList,
    AnnotationDetailsContainer,
  },
  computed: {
    configUI: get('currentProject/configUI'),
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
  },
  methods: {
    isPanelDisplayed(panel) {
      return this.configUI[`project-explore-${panel}`];
    },

    centerViewOnAnnot(annot) {
      let geometry = this.format.readGeometry(annot.location);
      this.view.fit(geometry, {duration: 500, padding: [10, 10, 10, 10], maxZoom: this.image.zoom});
    },

    addTerm(term) {
      this.$store.dispatch(this.viewerModule + 'addTerm', term);
    },

    addTrack(track) {
      this.$store.dispatch(this.viewerModule + 'refreshTracks', {idImage: track.image});
    },

    async updateTermsOrTracks(annot) {
      let updatedAnnot = await annot.clone().fetch();
      await updateTermProperties(updatedAnnot);
      await updateTrackProperties(updatedAnnot);

      this.$eventBus.$emit('editAnnotation', updatedAnnot);
      this.$store.commit(this.imageModule + 'changeAnnotSelectedFeature', {indexFeature: 0, annot: updatedAnnot});
    },

    updateProperties() {
      this.$store.dispatch(this.imageModule + 'refreshProperties', this.index);
    },

    handleDeletion(annot) {
      this.$store.commit(this.imageModule + 'addAction', {annot: annot, type: Action.DELETE});
      this.$eventBus.$emit('deleteAnnotation', annot);
    },
  }
};
</script>

<style scoped>

</style>
