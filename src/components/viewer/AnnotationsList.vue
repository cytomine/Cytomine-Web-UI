<template>
  <div class="annotations-list-wrapper">
    <div v-show="opened" class="annotations-list-opened">
      <button class="delete" @click="opened = false"></button>

      <div class="annotations-list-sidebar">
        <b-field position="is-centered" v-if="hasTracks">
          <b-radio-button v-model="displayType" native-value="term" size="is-small">
            {{$t('by-term')}}
          </b-radio-button>
          <b-radio-button v-model="displayType" native-value="track" size="is-small">
            {{$t('by-track')}}
          </b-radio-button>
        </b-field>

        <ontology-tree
          v-if="isDisplayedByTerm"
          v-model="selectedTermsIds"
          :ontology="ontology"
          :multiple-selection="false"
          :hidden-nodes="hiddenTermsIds"
          :additional-nodes="[noTermOption]"
        />

        <track-tree
          v-if="!isDisplayedByTerm"
          v-model="selectedTracksIds"
          :tracks="tracks"
          :multiple-selection="false"
        />
      </div>

      <div class="annotations-list-container">
        <list-annotations-by-term
          v-if="isDisplayedByTerm"
          :size="85"
          color="000000"
          :nb-per-page="nbPerPage"

          :all-terms="terms"
          :all-users="allUsers"
          :all-images="[image]"
          :all-tracks="tracks"

          :term="findTerm(selectedTermId)"
          :multiple-terms="false"
          :no-term="noTerm"
          :images-ids="[image.id]"
          :slices-ids="[slice.id]"
          :users-ids="layersIds"
          :reviewed="false"

          :visible="opened"
          :index="index"
          :revision="revision"

          @updateTermsOrTracks="$emit('updateTermsOrTracks', $event)"
          @updateProperties="$emit('updateProperties')"
          @centerView="$emit('centerView', $event)"
          @delete="$emit('delete', $event)"
          @select="select($event)"
        />
        <list-annotations-by-track
          v-else
          :size="85"
          color="000000"
          :nb-per-page="nbPerPage"

          :all-terms="terms"
          :all-users="allUsers"
          :all-images="[image]"
          :all-tracks="tracks"

          :track="findTrack(selectedTrackId)"
          :multiple-track="false"
          :no-track="false"
          :images-ids="[image.id]"
          :slices-ids="[slice.id]"
          :users-ids="layersIds"
          :reviewed="false"

          :visible="opened"
          :index="index"
          :revision="revision"

          @updateTermsOrTracks="$emit('updateTermsOrTracks', $event)"
          @updateProperties="$emit('updateProperties')"
          @centerView="$emit('centerView', $event)"
          @delete="$emit('delete', $event)"
          @select="select($event)"
        />
      </div>
    </div>

    <div v-show="!opened" class="opener" @click="opened = true">{{$t("annotations-list")}} <i class="fas fa-caret-up"></i></div>
  </div>
</template>

<script>
import {UserCollection, UserJobCollection} from 'cytomine-client';

import CytomineTerm from '@/components/ontology/CytomineTerm';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import AnnotationPreview from '@/components/annotations/AnnotationPreview';
import OntologyTree from '@/components/ontology/OntologyTree';
import TrackTree from '@/components/track/TrackTree';
import ListAnnotationsByTerm from '@/components/annotations/ListAnnotationsByTerm';
import ListAnnotationsByTrack from '@/components/annotations/ListAnnotationsByTrack';

import {fullName} from '@/utils/user-utils.js';
import {get} from '@/utils/store-helpers';


export default {
  name: 'annotations-list',
  components: {
    ListAnnotationsByTerm,
    ListAnnotationsByTrack,
    OntologyTree,
    TrackTree,
    CytomineTerm,
    CytomineMultiselect,
    CytomineSlider,
    AnnotationPreview
  },
  props: [
    'index',
    'view'
  ],
  data() {
    return {
      displayType: 'term',
      nbPerPage: 10,
      selectedTermsIds: [],
      selectedTracksIds: [],
      noTermOption: {id: 0, name: this.$t('no-term')},

      users: [],
      userJobs: [],

      revision: 0
    };
  },
  computed: {
    ontology: get('currentProject/ontology'),

    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    terms() {
      return this.$store.getters['currentProject/terms'] || [];
    },
    hiddenTermsIds() {
      return this.$store.getters[this.imageModule + 'hiddenTermsIds'];
    },
    additionalNodes() {
      return [this.noTermOption];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    isActiveImage() {
      return this.viewerWrapper.activeImage === this.index;
    },
    slice() {
      return this.imageWrapper.activeSlice;
    },
    tracks() {
      return this.imageWrapper.tracks.tracks;
    },
    hasTracks() {
      return this.tracks.length > 0;
    },
    layers() {
      let layers = this.imageWrapper.layers.selectedLayers || [];
      layers = layers.filter(layer => layer.visible);
      layers.forEach(layer => layer.fullName = fullName(layer));
      return layers;
    },
    layersIds() {
      return this.layers.map(layer => layer.id);
    },
    allUsers() {
      let allUsers = this.users.concat(this.userJobs);
      allUsers.forEach(user => user.fullName = fullName(user));
      return allUsers;
    },
    opened: {
      get() {
        return this.imageWrapper.annotationsList.open;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setShowAnnotationsList', value);
      }
    },
    isDisplayedByTerm() {
      return this.displayType === 'term';
    },
    noTerm() {
      return this.selectedTermsIds.includes(this.noTermOption.id);
    },
    selectedTermId() {
      return (this.selectedTermsIds.length > 0) ? this.selectedTermsIds[0] : null;
    },
    selectedTrackId() {
      return (this.selectedTracksIds.length > 0) ? this.selectedTracksIds[0] : null;
    },
  },
  watch: {
    hasTracks(value) {
      if (!value) {
        this.displayType = 'term';
      }
    }
  },
  methods: {
    findTerm(idTerm) {
      return this.terms.find(term => term.id === idTerm);
    },
    findTrack(idTrack) {
      return this.tracks.find(track => track.id === idTrack);
    },
    async fetchUsers() { // TODO in vuex (project module)
      this.users = (await UserCollection.fetchAll()).array;
    },
    async fetchUserJobs() { // TODO in vuex (project module)
      this.userJobs = (await UserJobCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.image.project
      })).array;
    },
    addAnnotationHandler(annotation) {
      if(annotation.image === this.image.id) {
        this.revision++;
      }
    },
    reloadAnnotationsHandler(idImage) {
      if(idImage == null || idImage === this.image.id) {
        this.revision++;
      }
    },
    editAnnotationHandler(updatedAnnot) {
      if(updatedAnnot.image === this.image.id) {
        this.revision++;
      }
    },
    deleteAnnotationHandler(deletedAnnot) {
      if(deletedAnnot.image === this.image.id) {
        this.revision++;
      }
    },
    select(annot) {
      if (annot.slice !== this.slice.id) {
        this.$store.dispatch(this.imageModule + 'setActiveSliceByPosition',
          {time: annot.time, channel: annot.channel, zStack: annot.zStack});
        this.$store.commit(this.imageModule + 'setAnnotToSelect', annot);
        this.$eventBus.$emit('reloadAnnotations', {idImage: this.image.id, hard: true});
      }
      else {
        this.$eventBus.$emit('selectAnnotation', {index: this.index, annot});
      }

      this.$emit('centerView', annot);
    },

    shortkeyHandler(key) {
      if (!this.isActiveImage) {
        return;
      }

      if (key === 'toggle-annotations') {
        this.opened = !this.opened;
      }
    }
  },
  async created() {
    let availableTerms = [...this.terms, this.noTermOption];
    this.selectedTermsIds = [availableTerms[0].id];
    this.selectedTracksIds = (this.hasTracks) ? [this.tracks[0].id] : [];

    this.fetchUsers();
    this.fetchUserJobs();
  },
  mounted() {
    this.$eventBus.$on('addAnnotation', this.addAnnotationHandler);
    this.$eventBus.$on('reloadAnnotations', this.reloadAnnotationsHandler);
    this.$eventBus.$on('editAnnotation', this.editAnnotationHandler);
    this.$eventBus.$on('deleteAnnotation', this.deleteAnnotationHandler);
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
  },
  beforeDestroy() {
    // unsubscribe from all events
    this.$eventBus.$off('addAnnotation', this.addAnnotationHandler);
    this.$eventBus.$off('reloadAnnotations', this.reloadAnnotationsHandler);
    this.$eventBus.$off('editAnnotation', this.editAnnotationHandler);
    this.$eventBus.$off('deleteAnnotation', this.deleteAnnotationHandler);
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
  }
};
</script>

<style scoped>
.annotations-list-opened {
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  background: #f5f5f5;
  height: 25vh;
  pointer-events: auto;
  display: flex;
}

.delete {
  position: absolute;
  right: 25px;
  top: 7px;
  z-index: 10;
}

.annotations-list-container {
  overflow: auto;
  position: relative;
  border-bottom: 1px solid #ccc;
  height: 100%;
  width: 100%;
  padding-right: 25px;
}

.opener {
  background: #f5f5f5;
  width: 150px;
  border-radius: 5px 5px 0px 0px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  margin: auto;
  text-align: center;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.3px;
  cursor: pointer;
  pointer-events: auto;
}

.opener .fas {
  margin-left: 5px;
  font-size: 12px;
  line-height: 10px;
}

.box {
  background: unset;
  border-radius: unset;
  box-shadow: unset;
  padding: 0.75rem;
  height: 100%;
}

>>> h2 {
  margin-bottom: 0;
}

.annotations-list-sidebar {
  padding: 10px;
  overflow-y: auto;
  min-width: 18em;
}

>>> ul.pagination-list {
  justify-content: flex-end;
}
</style>
