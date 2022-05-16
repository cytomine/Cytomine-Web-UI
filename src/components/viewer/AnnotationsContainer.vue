<template>
  <div>
    <annotation-details-container
      v-if="isPanelDisplayed('annotation-main')"
      :index="index"
      @select="selectAnnotation"
      @centerView="centerView({annot: $event, sameView: true})"
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

import AnnotationDetailsContainer from './AnnotationDetailsContainer';

export default {
  name: 'AnnotationsContainer',
  props: {
    index: String,
  },
  data() {
    return {
      format: new WKT(),
    };
  },
  components: {
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

    selectAnnotation({annot, options}) {
      let index = (options.trySameView) ? this.index : null;
      this.$eventBus.$emit('selectAnnotation', {index, annot, center: true});
    },

    centerView({annot, sameView=false}) {
      if (sameView) {
        this.$emit('centerView', annot);
      }
      else {
        this.$eventBus.$emit('selectAnnotation', {index: null, annot, center: true});
      }
    }
  }
};
</script>

<style scoped>

</style>
