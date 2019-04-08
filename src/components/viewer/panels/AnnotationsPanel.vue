<!-- TODO: handle review mode -->
<template>
<div class="layers">
  <h1>{{ $t('annotation-layers') }}</h1>
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else>
    <b-field>
      <b-select :placeholder="$t('select-layer')" size="is-small" v-model="selectedLayer">
        <option v-for="layer in unselectedLayers" :value="layer" :key="layer.id">
          {{ layerName(layer) }}
        </option>
      </b-select>
      <button class="button is-small" @click="addLayer()" :disabled="!selectedLayer">{{ $t('button-add') }}</button>
    </b-field>
    <table class="table">
      <thead>
        <tr>
          <th class="checkbox-column"><span class="far fa-eye"></span></th>
          <th class="checkbox-column"><span class="fas fa-pencil-alt"></span></th>
          <th class="name-column"></th>
          <th class="checkbox-column"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(layer, index) in selectedLayers" :key="layer.id">
          <td class="checkbox-column">
            <b-checkbox size="is-small" :value="layer.visible" @input="toggleLayerVisibility(index)" />
          </td>
          <td class="checkbox-column">
            <b-checkbox size="is-small" :value="layer.drawOn" :disabled="!canDraw(layer)" @input="toggleLayerDrawOn(index)" />
          </td>

          <td class="name-column">
            {{ layerName(layer) }}
          </td>
          <td class="checkbox-column">
            <button class="button is-small" @click="removeLayer(index)">
              <span class="fas fa-times"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="opacity">
      <label>{{ $t('layers-opacity') }}</label>
      <input class="slider is-fullwidth is-small" v-model="layersOpacity" step="0.05" min="0" max="1" type="range">
    </div>
  </template>
</div>
</template>

<script>
import {fullName} from '@/utils/user-utils.js';
import {ProjectDefaultLayerCollection} from 'cytomine-client';

export default {
  name: 'annotations-panel',
  props: {
    idViewer: String,
    index: Number,
    layersToPreload: Array
  },
  data() {
    return {
      error: false,

      layers: [], // Array<User> (representing user layers)
      indexLayers: [],
      selectedLayer: null
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.user;
    },
    project() {
      return this.$store.state.project.project;
    },
    imageWrapper() {
      return this.$store.state.images.viewers[this.idViewer].maps[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    layersOpacity: {
      get() {
        return this.imageWrapper.layersOpacity;
      },
      set(value) {
        this.$store.commit('setLayersOpacity', {
          idViewer: this.idViewer,
          index: this.index,
          opacity: Number(value)
        });
      }
    },
    layersIds() {
      return this.layers.map(layer => layer.id);
    },
    selectedLayers() { // Array<User> (representing user layers)
      // if image instance was changed (e.g. with previous/next image navigation), some of the selected layers
      // may not be relevant for the current image => filter them
      let layersIds = this.layers.map(layer => layer.id);
      let selectedLayers = this.imageWrapper.selectedLayers || [];
      return selectedLayers.filter(layer => layersIds.includes(layer.id));
    },
    selectedLayersIds() {
      return this.selectedLayers.map(layer => layer.id);
    },
    unselectedLayers() {
      return this.layers.filter(layer => !this.selectedLayersIds.includes(layer.id));
    }
  },
  watch: {
    activePanel() {
      this.fetchIndexLayers();
    }
  },
  methods: {
    annotationEventHandler(annot) {
      if(annot.image === this.image.id) {
        this.fetchIndexLayers();
      }
    },
    reloadAnnotationsHandler(idImage) {
      if(!idImage || idImage === this.image.id) {
        this.fetchIndexLayers();
      }
    },

    layerName(layer) {
      if(layer.isReview) {
        return this.$t('review-layer');
      }

      let name = fullName(layer);

      let indexLayer = this.indexLayers.find(index => index.user === layer.id) || {};
      return `${name} (${indexLayer.countAnnotation || 0})`;
    },

    canDraw(layer) {
      return !layer.isReview && this.$store.getters.canEditLayer(layer.id);
    },

    addLayerById(id, visible) {
      let layer = this.layers.find(layer => layer.id === id);
      if(layer) {
        this.addLayer(layer, visible);
      }
    },

    addLayer(layer = this.selectedLayer, visible = true) {
      if(this.selectedLayersIds.includes(layer.id)) {
        return;
      }

      layer.visible = visible;
      layer.drawOn = (layer.id === this.currentUser.id && this.canDraw(layer));
      this.$store.dispatch('addLayer', {idViewer: this.idViewer, index: this.index, layer});

      this.selectedLayer = null;
    },

    removeLayer(index, cacheSelectedFeatures=false) {
      this.$store.dispatch('removeLayer', {
        idViewer: this.idViewer,
        index: this.index,
        indexLayer: index,
        cacheSelectedFeatures
      });
    },

    toggleLayerVisibility(index) {
      this.$store.dispatch('toggleLayerVisibility', {
        idViewer: this.idViewer,
        index: this.index,
        indexLayer: index
      });
    },

    toggleLayerDrawOn(index) {
      this.$store.commit('toggleLayerDrawOn', {
        idViewer: this.idViewer,
        index: this.index,
        indexLayer: index
      });
    },

    async fetchLayers() {
      this.layers = (await this.project.fetchUserLayers(this.image.id)).array;
      if(this.image.inReview || this.image.reviewed) {
        this.layers.push({
          id: -1,
          isReview: true
        });
      }
    },

    async fetchIndexLayers(force=false) {
      if(!force && this.activePanel !== 'layers') {
        return;
      }
      this.indexLayers = await this.image.fetchAnnotationsIndex();
    }
  },
  async created() {
    try {
      await Promise.all([this.fetchLayers(), this.fetchIndexLayers(true)]);
    }
    catch(error) {
      console.log(error);
      this.error = true;
      this.$notify({type: 'error', text: this.$t('notif-error-loading-annotation-layers')});
      return;
    }

    let layersToAdd = [];
    if(this.layersToPreload) {
      this.layersToPreload.forEach(id => layersToAdd.push({id, visible: true}));
    }

    if(!this.imageWrapper.selectedLayers) { // we do not use computed property selectedLayers because we don't want the replacement by [] if the store array is null
      if(!this.layersToPreload || !this.layersToPreload.includes(this.currentUser.id)) {
        layersToAdd.push({id: this.currentUser.id, visible: true});
      }

      try {
        let defaultLayers = await ProjectDefaultLayerCollection.fetchAll({
          filterKey: 'project',
          filterValue: this.project.id
        });

        let addedIds = layersToAdd.map(layer => layer.id);

        defaultLayers.array.forEach(({user, hideByDefault}) => {
          if(!addedIds.includes(user)) {
            layersToAdd.push({id: user, visible: !hideByDefault});
          }
        });
      }
      catch(error) {
        console.log(error);
      }
    }

    layersToAdd.map(layer => this.addLayerById(layer.id, layer.visible));
  },
  mounted() {
    this.$eventBus.$on(['addAnnotation', 'deleteAnnotation'], this.annotationEventHandler);
    this.$eventBus.$on('reloadAnnotations', this.reloadAnnotationsHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off(['addAnnotation', 'deleteAnnotation'], this.annotationEventHandler);
    this.$eventBus.$off('reloadAnnotations', this.reloadAnnotationsHandler);
  }
};
</script>

<style scoped>
>>> select {
  width: 220px;
}

.table {
  margin-bottom: 10px !important;
  font-size: 0.9em;
}

.table tbody {
  display:block;
  overflow:auto;
  max-height: 100px;
}

.table thead tr {
  display: block;
}

td, th {
  padding: 3px !important;
  vertical-align: middle !important;
}

td .button {
  width: 17px;
  height: 17px;
  padding: 0px;
}

.checkbox-column {
  width: 25px;
  text-align: center !important;
}

.name-column {
  width: 200px;
}

>>> .checkbox .control-label {
  padding: 0px !important;
}

>>> input[type="range"].slider {
  margin: 0px;
}

.opacity {
  display: flex;
  align-items: center;
}

.opacity label {
  text-transform: uppercase;
  font-size: 11px;
  width: 150px;
}
</style>
