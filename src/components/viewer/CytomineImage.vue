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
<div class="map-container" @click="isActiveImage = true" ref="container">
  <template v-if="!loading && zoom !== null">
    <vl-map
      :data-projection="projectionName"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      :keyboard-event-target="document"
      @pointermove="projectedMousePosition = $event.coordinate"
      @mounted="updateKeyboardInteractions"
      ref="map"
    >

      <vl-view
        :center.sync="center"
        :zoom.sync="zoom"
        :rotation.sync="rotation"
        :max-zoom="maxZoom"
        :max-resolution="Math.pow(2, image.depth)"
        :extent="extent"
        :projection="projectionName"
        @mounted="viewMounted()"
        ref="view"
      />

      <vl-layer-tile :extent="extent" @mounted="addOverviewMap" ref="baseLayer">
        <vl-source-zoomify
          :projection="projectionName"
          :urls="baseLayerURLs"
          :size="imageSize"
          :extent="extent"
          crossOrigin="Anonymous"
          ref="baseSource"
          @mounted="setBaseSource()"
        />
      </vl-layer-tile>

      <vl-layer-image>
        <vl-source-raster
          v-if="baseSource && colorManipulationOn"
          :sources="[baseSource]"
          :operation="operation"
          :lib="lib"
        />
      </vl-layer-image>

      <annotation-layer
        v-for="layer in selectedLayers"
        :key="'layer-'+layer.id"
        :index="index"
        :layer="layer"
      />

      <select-interaction v-if="activeSelectInteraction" :index="index" />
      <draw-interaction v-if="activeDrawInteraction" :index="index" />
      <modify-interaction v-if="activeModifyInteraction" :index="index" />

    </vl-map>

    <div v-if="configUI['project-tools-main']" class="draw-tools">
      <draw-tools :index="index" />
    </div>

    <div class="panels">
      <ul>
        <li>
          <a @click="$emit('close')" class="close">
            <i class="fas fa-times-circle"></i>
          </a>
        </li>

        <template v-if="isPanelDisplayed('hide-tools')">
          <li v-if="isPanelDisplayed('info')">
            <a @click="togglePanel('info')" :class="{active: activePanel === 'info'}">
              <i class="fas fa-info"></i>
            </a>
            <information-panel class="panel-options" v-show="activePanel === 'info'" :index="index" />
          </li>

          <li v-if="isPanelDisplayed('digital-zoom')">
            <a @click="togglePanel('digital-zoom')" :class="{active: activePanel === 'digital-zoom'}">
              <i class="fas fa-search"></i>
            </a>
            <digital-zoom class="panel-options" v-show="activePanel === 'digital-zoom'" :index="index" />
          </li>

          <li v-if="isPanelDisplayed('link') && nbImages > 1">
            <a @click="togglePanel('link')" :class="{active: activePanel === 'link'}">
              <i class="fas fa-link"></i>
            </a>
            <link-panel class="panel-options" v-show="activePanel === 'link'" :index="index" />
          </li>

          <li v-if="isPanelDisplayed('color-manipulation')">
            <a @click="togglePanel('colors')" :class="{active: activePanel === 'colors'}">
              <i class="fas fa-adjust"></i>
            </a>
            <color-manipulation class="panel-options" v-show="activePanel === 'colors'" :index="index" />
          </li>

          <li v-if="isPanelDisplayed('image-layers')">
            <a @click="togglePanel('layers')" :class="{active: activePanel === 'layers'}">
              <i class="fas fa-copy"></i>
            </a>
            <layers-panel class="panel-options" v-show="activePanel === 'layers'"
              :index="index" :layers-to-preload="layersToPreload"
            />
          </li>

          <li v-if="isPanelDisplayed('ontology') && terms && terms.length > 0">
            <a @click="togglePanel('ontology')" :class="{active: activePanel === 'ontology'}">
              <i class="fas fa-hashtag"></i>
            </a>
            <ontology-panel class="panel-options" v-show="activePanel === 'ontology'" :index="index" />
          </li>

          <li  v-if="isPanelDisplayed('property')">
            <a @click="togglePanel('properties')" :class="{active: activePanel === 'properties'}">
              <i class="fas fa-tag"></i>
            </a>
            <properties-panel class="panel-options" v-show="activePanel === 'properties'" :index="index" />
          </li>

          <li v-if="isPanelDisplayed('follow')">
            <a @click="togglePanel('follow')" :class="{active: activePanel === 'follow'}">
              <i class="fas fa-street-view"></i>
            </a>
            <follow-panel class="panel-options" v-show="activePanel === 'follow'" :index="index" :view="$refs.view" />
          </li>

          <li v-if="isPanelDisplayed('review') && canEdit">
            <a @click="togglePanel('review')" :class="{active: activePanel === 'review'}">
              <i class="fas fa-check-circle"></i>
            </a>
            <review-panel class="panel-options" v-show="activePanel === 'review'" :index="index" />
          </li>
        </template>
      </ul>
    </div>

    <div class="broadcast" v-if="imageWrapper.tracking.broadcast">
      <i class="fas fa-circle"></i> {{$t('live')}}
    </div>

    <rotation-selector class="rotation-selector-wrapper" :index="index" />

    <scale-line :image="image" :zoom="zoom" :mousePosition="projectedMousePosition" />

    <annotation-details-container v-if="isPanelDisplayed('annotation-main')" :index="index" :view="$refs.view" />

    <div class="custom-overview" ref="overview">
      <p class="image-name" :class="{hidden: overviewCollapsed}">
        <image-name :image="image" />
      </p>
    </div>
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import _ from 'lodash';

import ImageName from '@/components/image/ImageName';
import AnnotationLayer from './AnnotationLayer';
import RotationSelector from './RotationSelector';
import ScaleLine from './ScaleLine';
import DrawTools from './DrawTools';

import InformationPanel from './panels/InformationPanel';
import DigitalZoom from './panels/DigitalZoom';
import ColorManipulation from './panels/ColorManipulation';
import LinkPanel from './panels/LinkPanel';
import LayersPanel from './panels/LayersPanel';
import OntologyPanel from './panels/OntologyPanel';
import PropertiesPanel from './panels/PropertiesPanel';
import FollowPanel from './panels/FollowPanel';
import ReviewPanel from './panels/ReviewPanel';

import AnnotationDetailsContainer from './AnnotationDetailsContainer';

import SelectInteraction from './interactions/SelectInteraction';
import DrawInteraction from './interactions/DrawInteraction';
import ModifyInteraction from './interactions/ModifyInteraction';

import {addProj, createProj, getProj} from 'vuelayers/lib/ol-ext';

import View from 'ol/View';
import OverviewMap from 'ol/control/OverviewMap';
import {KeyboardPan, KeyboardZoom} from 'ol/interaction';
import {noModifierKeys, targetNotEditable} from 'ol/events/condition';
import WKT from 'ol/format/WKT';

import {ImageConsultation, Annotation, AnnotationType, UserPosition} from 'cytomine-client';

import {constLib, operation} from '@/utils/color-manipulation.js';

import constants from '@/utils/constants.js';

export default {
  name: 'cytomine-image',
  props: {
    index: String
  },
  components: {
    ImageName,

    AnnotationLayer,

    RotationSelector,
    ScaleLine,
    DrawTools,

    AnnotationDetailsContainer,

    InformationPanel,
    DigitalZoom,
    ColorManipulation,
    LinkPanel,
    LayersPanel,
    OntologyPanel,
    PropertiesPanel,
    FollowPanel,
    ReviewPanel,

    SelectInteraction,
    DrawInteraction,
    ModifyInteraction
  },
  data() {
    return {
      minZoom: 0,

      projectedMousePosition: [0, 0],

      baseSource: null,
      routedAnnotation: null,

      timeoutSavePosition: null,

      loading: true,

      overview: null
    };
  },
  computed: {
    document() {
      return document;
    },
    routedAction() {
      return this.$route.query.action;
    },
    configUI: get('currentProject/configUI'),
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    nbImages() {
      return Object.keys(this.viewerWrapper.images).length;
    },
    imageWrapper() {
      return this.viewerWrapper.images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    canEdit() {
      return this.$store.getters['currentProject/canEditImage'](this.image);
    },
    projectionName() {
      return `CYTO-${this.image.id}`;
    },
    terms() {
      return this.$store.getters['currentProject/terms'];
    },
    selectedLayers() {
      return this.imageWrapper.layers.selectedLayers || [];
    },
    isActiveImage: {
      get() {
        return this.viewerWrapper.activeImage === this.index;
      },
      set(value) {
        if(value) {
          if(this.viewerWrapper) {
            this.$store.commit(this.viewerModule + 'setActiveImage', this.index);
          }
        }
        else {
          throw new Error('Cannot unset active map');
        }
      }
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    activeTool() {
      return this.imageWrapper.draw.activeTool;
    },
    activeEditTool() {
      return this.imageWrapper.draw.activeEditTool;
    },
    maxZoom() {
      return this.$store.getters[this.imageModule + 'maxZoom'];
    },

    center: {
      get() {
        return this.imageWrapper.view.center;
      },
      set(value) {
        this.$store.dispatch(this.viewerModule + 'setCenter', {index: this.index, center: value});
      }
    },
    zoom: {
      get() {
        return this.imageWrapper.view.zoom;
      },
      set(value) {
        this.$store.dispatch(this.viewerModule + 'setZoom', {index: this.index, zoom: Number(value)});
      }
    },
    rotation: {
      get() {
        return this.imageWrapper.view.rotation;
      },
      set(value) {
        this.$store.dispatch(this.viewerModule + 'setRotation', {index: this.index, rotation: Number(value)});
      }
    },

    viewState() {
      return {center: this.center, zoom: this.zoom, rotation: this.rotation};
    },

    extent() {
      return [0, 0, this.image.width, this.image.height];
    },
    imageSize() {
      return [this.image.width, this.image.height];
    },

    baseLayerURLs() {
      let filterPrefix = this.imageWrapper.colors.filter || '';
      let params = `&tileGroup={TileGroup}&x={x}&y={y}&z={z}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`;
      return this.image.imageServerURLs.map(url => filterPrefix + url + params);
    },

    colorManipulationOn() {
      return this.imageWrapper.colors.brightness !== 0 || this.imageWrapper.colors.contrast !== 0
                || this.imageWrapper.colors.hue !== 0 || this.imageWrapper.colors.saturation !== 0;
    },
    operation() {
      return operation;
    },
    lib() {
      return {
        ...constLib,
        brightness: this.imageWrapper.colors.brightness,
        contrast: this.imageWrapper.colors.contrast,
        saturation: this.imageWrapper.colors.saturation,
        hue: this.imageWrapper.colors.hue
      };
    },

    layersToPreload() {
      let layers = [];
      if(this.routedAnnotation) {
        layers.push(this.routedAnnotation.type === AnnotationType.REVIEWED ? -1 : this.routedAnnotation.user);
      }
      if(this.routedAction === 'review' && !layers.includes(-1)) {
        layers.push(-1);
      }
      return layers;
    },

    overviewCollapsed() {
      return this.overview ? this.overview.getCollapsed() : this.imageWrapper.view.overviewCollapsed;
    },

    correction() {
      return ['correct-add', 'correct-remove'].includes(this.activeEditTool);
    },
    activeSelectInteraction() {
      return this.activeTool === 'select';
    },
    activeDrawInteraction() {
      return !this.activeSelectInteraction || this.correction;
    },
    activeModifyInteraction() {
      return this.activeSelectInteraction && this.activeEditTool && !this.correction;
    }
  },
  watch: {
    viewState() {
      this.savePosition();
    },
    overviewCollapsed(value) {
      this.$store.commit(this.imageModule + 'setOverviewCollapsed', value);
    }
  },
  methods: {
    setInitialZoom() {
      if(this.zoom !== null) {
        return; // not the first time the viewer is opened => zoom was already initialized
      }

      let container = this.$refs.container;
      let mapWidth = this.image.width;
      let mapHeight = this.image.height;
      let idealZoom = this.image.depth;
      while(mapWidth > container.clientWidth || mapHeight > container.clientHeight) {
        mapWidth /= 2;
        mapHeight /= 2;
        idealZoom --;
      }
      this.zoom = idealZoom;
    },

    async updateMapSize() {
      await this.$nextTick();
      if(this.$refs.map) {
        this.$refs.map.updateSize();
      }
    },

    async updateKeyboardInteractions() {
      await this.$refs.map.$createPromise; // wait for ol.Map to be created

      this.$refs.map.$map.getInteractions().forEach(interaction => {
        if(interaction instanceof KeyboardPan || interaction instanceof KeyboardZoom) {
          interaction.condition_ = (mapBrowserEvent) => {
            return noModifierKeys(mapBrowserEvent)
              && targetNotEditable(mapBrowserEvent)
              && this.isActiveImage
              && !mapBrowserEvent.originalEvent.target.classList.contains('ql-editor');
          };
        }
      });
    },

    async viewMounted() {
      await this.$refs.view.$createPromise; // wait for ol.View to be created

      if(this.routedAnnotation) { // center view on annotation
        let annot = this.routedAnnotation;
        let geometry = new WKT().readGeometry(annot.location);
        this.$refs.view.fit(geometry, {padding: [10, 10, 10, 10], maxZoom: this.image.depth});

        // HACK: center set by view.fit() is incorrect => reset it manually
        this.center = (geometry.getType() === 'Point') ? geometry.getFirstCoordinate()
          : [annot.centroid.x, annot.centroid.y];
        // ---
      }

      this.savePosition();
    },

    async setBaseSource() {
      await this.$refs.baseSource.$createPromise;
      this.baseSource = this.$refs.baseSource.$source;
    },

    async addOverviewMap() {
      if(!this.isPanelDisplayed('overview')) {
        return;
      }

      await this.$refs.map.$createPromise; // wait for ol.Map to be created
      await this.$refs.baseLayer.$createPromise; // wait for ol.Layer to be created

      this.overview = new OverviewMap({
        view: new View({projection: this.projectionName}),
        layers: [this.$refs.baseLayer.$layer],
        tipLabel: this.$t('overview'),
        target: this.$refs.overview,
        collapsed: this.imageWrapper.view.overviewCollapsed
      });
      this.$refs.map.$map.addControl(this.overview);
    },

    toggleOverview() {
      if (this.overview) {
        this.overview.setCollapsed(!this.imageWrapper.view.overviewCollapsed);
      }
    },

    togglePanel(panel) {
      this.$store.commit(this.imageModule + 'togglePanel', panel);
    },

    savePosition: _.debounce(async function() {
      if(this.$refs.view) {
        let extent = this.$refs.view.$view.calculateExtent(); // [minX, minY, maxX, maxY]

        try {
          await UserPosition.create({
            image: this.image.id,
            zoom: this.zoom,
            rotation: this.rotation,
            bottomLeftX: Math.round(extent[0]),
            bottomLeftY: Math.round(extent[1]),
            bottomRightX: Math.round(extent[2]),
            bottomRightY: Math.round(extent[1]),
            topLeftX: Math.round(extent[0]),
            topLeftY: Math.round(extent[3]),
            topRightX: Math.round(extent[2]),
            topRightY: Math.round(extent[3]),
            broadcast: this.imageWrapper.tracking.broadcast
          });
        }
        catch(error) {
          console.log(error);
          this.$notify({type: 'error', text: this.$t('notif-error-save-user-position')});
        }

        clearTimeout(this.timeoutSavePosition);
        this.timeoutSavePosition = setTimeout(this.savePosition, constants.SAVE_POSITION_IN_IMAGE_INTERVAL);
      }
    }, 500),

    isPanelDisplayed(panel) {
      return this.configUI[`project-explore-${panel}`];
    },
    shortkeyHandler(key) {
      if(!this.isActiveImage) { // shortkey should only be applied to active map
        return;
      }

      switch(key) {
        case 'toggle-information':
          if (this.isPanelDisplayed('info')){
            this.togglePanel('info');
          }
          return;
        case 'toggle-zoom':
          if (this.isPanelDisplayed('digital-zoom')) {
            this.togglePanel('digital-zoom');
          }
          return;
        case 'toggle-link':
          if (this.isPanelDisplayed('link') && this.nbImages > 1) {
            this.togglePanel('link');
          }
          return;
        case 'toggle-filters':
          if (this.isPanelDisplayed('color-manipulation')) {
            this.togglePanel('colors');
          }
          return;
        case 'toggle-layers':
          if (this.isPanelDisplayed('image-layers')) {
            this.togglePanel('layers');
          }
          return;
        case 'toggle-ontology':
          if (this.isPanelDisplayed('ontology') && this.terms && this.terms.length > 0) {
            this.togglePanel('ontology');
          }
          return;
        case 'toggle-properties':
          if (this.isPanelDisplayed('property')) {
            this.togglePanel('properties');
          }
          return;
        case 'toggle-broadcast':
          if (this.isPanelDisplayed('follow')) {
            this.togglePanel('follow');
          }
          return;
        case 'toggle-review':
          if (this.isPanelDisplayed('review') && this.canEdit) {
            this.togglePanel('review');
          }
          return;
        case 'toggle-overview':
          if (this.isPanelDisplayed('overview')) {
            this.toggleOverview();
          }
          return;
      }
    }
  },
  async created() {
    if(!getProj(this.projectionName)) { // if image opened for the first time
      let projection = createProj({code: this.projectionName, units: 'pixels', extent: this.extent});
      addProj(projection);
    }

    if(this.routedAction === 'review') {
      this.togglePanel('review');
      if(!this.image.inReview) {
        try {
          let clone = await this.image.clone().review();
          this.$store.commit(this.imageModule + 'setImageInstance', clone);
        }
        catch(error) {
          console.log(error);
          this.$notify({type: 'error', text: this.$t('notif-error-start-review')});
        }
      }
      this.$store.commit(this.imageModule + 'setReviewMode', true);
    }

    // remove all selected features in order to reselect them when they will be added to the map (otherwise,
    // issue with the select interaction)
    this.selectedLayers.forEach(layer => {
      this.$store.commit(this.imageModule + 'removeLayerFromSelectedFeatures', {layer, cache: true});
    });

    let idRoutedAnnot = this.$route.params.idAnnotation;
    if(idRoutedAnnot) {
      try {
        let annot = await Annotation.fetch(idRoutedAnnot);
        if(annot.image === this.image.id) {
          this.routedAnnotation = annot;
          if(this.routedAction === 'comments') {
            this.$store.commit(this.imageModule + 'setShowComments', annot);
          }
          this.$store.commit(this.imageModule + 'setAnnotToSelect', annot);
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-target-annotation')});
      }
    }

    try {
      await new ImageConsultation({image: this.image.id}).save();
    }
    catch(error) {
      console.log(error);
      this.$notify({type: 'error', text: this.$t('notif-error-save-image-consultation')});
    }

    this.loading = false;
  },
  mounted() {
    this.$eventBus.$on('updateMapSize', this.updateMapSize);
    this.$eventBus.$on('shortkeyEvent', this.shortkeyHandler);
    this.setInitialZoom();
  },
  beforeDestroy() {
    this.$eventBus.$off('updateMapSize', this.updateMapSize);
    this.$eventBus.$off('shortkeyEvent', this.shortkeyHandler);
    clearTimeout(this.timeoutSavePosition);
  }
};
</script>

<style lang="scss">
@import '~vuelayers/lib/style.css';

$backgroundPanelBar: #555;
$widthPanelBar: 2.8rem;
$backgroundPanel: #f2f2f2;
$colorPanelLink: #eee;
$colorHoverPanelLink: white;
$colorBorderPanelLink: #222;
$colorOpenedPanelLink: #6c95c8;

.map-container {
  display:flex;
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  flex-grow: 1;
}

.draw-tools {
  position: absolute;
  top: 0.7em;
  left: 3.5rem;
  right: $widthPanelBar;
  z-index: 10;
}

.broadcast {
  position: absolute;
  right: 4.5rem;
  top: 0.7em;
  text-transform: uppercase;
  font-weight: 600;
  background-color: #EE4242;
  color: white;
  padding: 0.25em 0.75em 0.25em 0.55em;
  border-radius: 5px;
  border: 2px solid white;

  i.fas {
    margin-right: 0.3em;
  }
}

.panels {
  background: $backgroundPanelBar;
  display: flex;
  font-size: 0.9em;

  > ul {
    padding: 0;
    margin: 0;

    > li {
      position: relative;

      > a {
        position: relative;
        display: block;
        width: $widthPanelBar;
        padding: 0.35rem 0.8rem;
        font-size: 1.25rem;
        color: $colorPanelLink;
        border-bottom: 1px solid $colorBorderPanelLink;
        text-decoration: none;
        text-align:center;

        &:hover {
          color: $colorHoverPanelLink;
        }

        &.active {
          background: $backgroundPanel;
          color: $colorOpenedPanelLink;
        }

        &.close {
          color: #ffc4c4;
          :hover {
            color: #ff7070;
          }
        }
      }
    }
  }
}

.panel-options {
  position: absolute;
  bottom: -1.75em;
  right: $widthPanelBar;
  width: 24em;
  min-height: 10em;
  background: $backgroundPanel;
  padding: 0.75em;
  border-radius: 5px 0 0 5px;
  z-index: 100;

  h1 {
    font-size: 1.1rem;
    padding-top: 0.3rem !important;
    padding-bottom: 1rem !important;
  }

  table {
    background: none;
    width: 100%;
  }
}

.panels li:nth-child(-n+7) .panel-options {
  bottom: -7.5em;
  min-height: 13em;
}

.panels li:nth-child(-n+3) .panel-options {
  top: -1.75em;
  bottom: auto;
  min-height: 7.5em;
}

.panels li:nth-child(4) .panel-options {
  top: -5.5em;
  bottom: auto;
}

/* ----- CUSTOM STYLE FOR OL CONTROLS ----- */

.ol-zoom, .ol-rotate {
  background: none !important;
}

.ol-rotate:not(.custom) {
  display: none;
}

.ol-control button {
  background: white !important;
  color: black !important;
  border-radius: 2px !important;
  box-shadow: 0 0 1px #777;

  &:hover {
    box-shadow: 0 0 1px black;
    cursor: pointer;
  }
}

.ol-zoom-in {
  margin-bottom: 5px !important;
}

/* ----- Rotation selector ----- */
.rotation-selector-wrapper {
  position: absolute;
  left: .5em;
  top: 5rem;
}

.custom-overview {
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  border-radius: 4px;

  .ol-overviewmap {
    position: static;
    background: none;
  }

  .ol-overviewmap:not(.ol-collapsed) button {
    bottom: 2px !important;
  }

  .image-name {
    font-size: 0.8em;
    padding: 2px 5px;
    width: 158px;
    word-wrap: break-word;

    &.hidden {
      display: none;
    }
  }
}
</style>
