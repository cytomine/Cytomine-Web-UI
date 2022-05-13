<template>
  <div class="annotations-list-wrapper">
  <!--
    <div v-show="opened" class="annotations-list-opened">
      <button class="delete" @click="opened = false"></button>

      <div class="annotations-list-sidebar">
        <b-field position="is-centered" v-if="hasTracks">
          <b-radio-button v-model="displayType" native-value="TERM" size="is-small">
            {{$t('by-term')}}
          </b-radio-button>
          <b-radio-button v-model="displayType" native-value="TRACK" size="is-small">
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
        <list-annotations-by v-if="currentItem" :key="currentItem.id"
          :categorization="displayType"
          :size="85"
          color="000000"
          :nb-per-page="nbPerPage"

          :prop="currentItem"

          :all-terms="terms"
          :all-users="allUsers"
          :all-images="[image]"
          :all-tracks="tracks"

          :multiple-terms="false"
          :no-term="noTerm"
          :multiple-track="false"
          :no-track="noTrack"

          :images-ids="[image.id]"
          :slices-ids="[slice.id]"
          :users-ids="layersIds"
          :terms-ids="termsOptionsIds"
          :tracks-ids="tracksIds"
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
    -->
  </div>
</template>

<script>
import {UserCollection, UserJobCollection} from 'cytomine-client';

import {fullName} from '@/utils/user-utils.js';
import {get} from '@/utils/store-helpers';


export default {
  name: 'annotations-list',
  components: {
  },
  props: [
    'index',
    'view'
  ],
  data() {
    return {
      displayType: 'TERM',
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
    image() {
      return this.imageWrapper.imageInstance;
    },
    isActiveImage() {
      return this.viewerWrapper.activeImage === this.index;
    },
    slice() {
      return this.imageWrapper.activeSlice;
    },

    isDisplayedByTerm() {
      return this.displayType === 'TERM';
    },
    items() {
      return (this.isDisplayedByTerm) ? this.termsOptions : this.tracks;
    },
    currentItem() {
      if(this.isDisplayedByTerm) {
        return this.termsOptions.find(term => term.id === this.selectedTermId);
      }
      else {
        return this.tracks.find(track => track.id === this.selectedTrackId);
      }
    },

    additionalNodes() {
      return [this.noTermOption];
    },
    terms() {
      return this.$store.getters['currentProject/terms'] || [];
    },
    hiddenTermsIds() {
      return this.$store.getters[this.imageModule + 'hiddenTermsIds'];
    },
    termsOptions() {
      return [...this.terms, ...this.additionalNodes].filter(term => !this.hiddenTermsIds.includes(term.id));
    },
    termsOptionsIds() {
      return this.termsOptions.map(term => term.id);
    },

    selectedTermId() {
      return (this.selectedTermsIds.length > 0) ? this.selectedTermsIds[0] : null;
    },
    noTerm() {
      return this.isDisplayedByTerm ? this.selectedTermId === this.noTermOption.id : this.termsOptionsIds.includes(this.noTermOption.id);
    },

    tracks() {
      return this.imageWrapper.tracks.tracks;
    },
    tracksIds() {
      let optionsIds = this.tracks.map(track => track.id);
      optionsIds.push(0); // Add 0 for "no track" option
      return optionsIds;
    },
    hasTracks() {
      return this.tracks.length > 0;
    },
    selectedTrackId() {
      return (this.selectedTracksIds.length > 0) ? this.selectedTracksIds[0] : null;
    },
    noTrack() {
      return this.isDisplayedByTerm;
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
  },
  watch: {
    hasTracks(value) {
      if (!value) {
        this.displayType = 'TERM';
      }
    }
  },
  methods: {
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
    async select(annot) {
      if (annot.slice !== this.slice.id) {
        await this.$store.dispatch(this.imageModule + 'setActiveSliceByPosition',
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
    this.selectedTermsIds = (this.termsOptionsIds.length > 0) ? [this.termsOptionsIds[0]] : [];
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
