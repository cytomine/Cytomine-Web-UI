<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<!-- TODO job templates -->
<!-- TODO shortcut keys (decide the ones to keep + help menu)-->
<template>
    <div class="map-container" v-if="!loading">

        <vl-map :data-projection="projectionName"
                :load-tiles-while-animating="true"
                :load-tiles-while-interacting="true"
                @pointermove="projectedMousePosition = $event.coordinate"
                ref="map">

            <vl-view :center.sync="center"
                     :zoom.sync="zoom"
                     :rotation.sync="rotation"
                     :max-zoom="maxZoom"
                     :min-zoom="minZoom"
                     :extent="extent"
                     :projection="projectionName"
                     @mounted="setViewMounted()"
                     ref="view">
            </vl-view>

            <vl-layer-tile :extent="extent" @mounted="addOverviewMap" ref="baseLayer">
                <vl-source-zoomify :projection="projectionName"
                                   :url="baseLayerURL"
                                   :size="imageSize"
                                   :extent="extent"
                                   :key="baseLayerURL"
                                   crossOrigin="Anonymous"
                                   ref="baseSource"
                                   @mounted="setBaseSource()">
                </vl-source-zoomify>
            </vl-layer-tile>

            <vl-layer-image>
                <vl-source-raster v-if="baseSource != null && colorManipulationOn"
                                  :sources="[baseSource]"
                                  :operation="operation"
                                  :lib="lib">
                </vl-source-raster>
            </vl-layer-image>

            <annotation-layer v-for="layer in selectedLayers" :key="'layer-'+layer.id"
                              :idViewer="idViewer"
                              :index="index"
                              :user-layer="layer">
            </annotation-layer>

            <select-interaction v-if="activeTool == 'select'" :idViewer="idViewer" :index="index">
            </select-interaction>

            <draw-interaction v-if="activeTool != 'select'" :idViewer="idViewer" :index="index">
            </draw-interaction>

            <modify-interaction v-if="activeTool == 'select' && activeEditTool != null"
                :idViewer="idViewer" :index="index">
            </modify-interaction>

        </vl-map>

        <div class="draw-tools">
            <draw-tools :idViewer="idViewer" :index="index"></draw-tools>
        </div>

        <div class="panels">
            <ul>
                <li>
                    <a @click="$emit('close')" class="close">
                        <i class="fas fa-times-circle"></i>
                    </a>
                </li>

                <li>
                    <a @click="togglePanel('info')" :class="{active: activePanel == 'info'}">
                        <i class="fas fa-info"></i>
                    </a>
                    <image-information class="panel-options panel-info" v-show="activePanel == 'info'"
                        :image="image"></image-information>
                </li>

                <li>
                    <a @click="togglePanel('digital-zoom')" :class="{active: activePanel == 'digital-zoom'}">
                        <i class="fas fa-search"></i>
                    </a>
                    <digital-zoom class="panel-options panel-digital-zoom"
                        v-show="activePanel == 'digital-zoom'" :idViewer="idViewer" :index="index"></digital-zoom>
                </li>

                <li v-if="viewerWrapper.maps.length > 1">
                    <a @click="togglePanel('link')" :class="{active: activePanel == 'link'}">
                        <i class="fas fa-link"></i>
                    </a>
                    <link-panel class="panel-options panel-link"
                        v-show="activePanel == 'link'" :idViewer="idViewer" :index="index"></link-panel>
                </li>

                <li>
                    <a @click="togglePanel('colors')" :class="{active: activePanel == 'colors'}">
                        <i class="fas fa-sliders-h"></i>
                    </a>
                    <color-manipulation class="panel-options panel-colors" v-show="activePanel == 'colors'"
                        :idViewer="idViewer" :index="index"></color-manipulation>
                </li>

                <li>
                    <a @click="togglePanel('layers')" :class="{active: activePanel == 'layers'}">
                        <i class="fas fa-copy"></i>
                    </a>
                    <annotations-panel class="panel-options panel-layers" v-show="activePanel == 'layers'"
                        :idViewer="idViewer" :index="index" :layers-to-preload="layersToPreload"
                        @hook:mounted="layersMounted = true">
                    </annotations-panel>
                </li>

                <li v-if="terms.length > 0">
                    <a @click="togglePanel('ontology')" :class="{active: activePanel == 'ontology'}">
                        <i class="fas fa-hashtag"></i>
                    </a>
                    <ontology-panel class="panel-options panel-ontology" v-show="activePanel == 'ontology'"
                        :idViewer="idViewer" :index="index"></ontology-panel>
                </li>

                <li>
                    <a @click="togglePanel('properties')" :class="{active: activePanel == 'properties'}">
                        <i class="fas fa-tag"></i>
                    </a>
                    <properties-panel class="panel-options panel-properties" v-show="activePanel == 'properties'"
                        :idViewer="idViewer" :index="index"></properties-panel>
                </li>

                <li>
                    <a @click="togglePanel('follow')" :class="{active: activePanel == 'follow'}">
                        <i class="fas fa-street-view"></i>
                    </a>
                    <follow-panel class="panel-options panel-follow" v-show="activePanel == 'follow'"
                        :idViewer="idViewer" :index="index" :project="project" :view="$refs.view"></follow-panel>
                </li>

                <li>
                    <a @click="togglePanel('guided-tour')" :class="{active: activePanel == 'guided-tour'}">
                        <i class="fas fa-map-signs"></i>
                    </a>
                    <guided-tour class="panel-options panel-guided-tour" v-show="activePanel == 'guided-tour'"
                        :view="$refs.view"></guided-tour>
                </li>
            </ul>
        </div>

        <rotation-selector class="rotation-selector-wrapper" :idViewer="idViewer" :index="index"></rotation-selector>

        <scale-line :image="image" :zoom="zoom" :mousePosition="projectedMousePosition"></scale-line>

        <annotation-details-container :idViewer="idViewer" :index="index"></annotation-details-container>
    </div>
</template>

<script>
import _ from "lodash";

import AnnotationLayer from "./AnnotationLayer";
import RotationSelector from "./RotationSelector";
import ScaleLine from "./ScaleLine";
import DrawTools from "./DrawTools";

import ImageInformation from "./panels/ImageInformation";
import DigitalZoom from "./panels/DigitalZoom";
import ColorManipulation from "./panels/ColorManipulation";
import LinkPanel from "./panels/LinkPanel";
import AnnotationsPanel from "./panels/AnnotationsPanel";
import OntologyPanel from "./panels/OntologyPanel";
import PropertiesPanel from "./panels/PropertiesPanel";
import FollowPanel from "./panels/FollowPanel";
import GuidedTour from "./panels/GuidedTour";

import AnnotationDetailsContainer from "./AnnotationDetailsContainer";

import SelectInteraction from "./interactions/SelectInteraction";
import DrawInteraction from "./interactions/DrawInteraction";
import ModifyInteraction from "./interactions/ModifyInteraction";

import {addProj, createProj, getProj} from "vuelayers/lib/ol-ext";

import View from "ol/View";
import OverviewMap from "ol/control/OverviewMap";
import WKT from "ol/format/WKT";

import {Annotation, UserPosition} from "cytomine-client";

import {constants, utilFunctions, operation} from "@/utils/color-manipulation.js";

export default {
    name: "cytomine-image",
    props: [
        "idViewer",
        "index",
        "project"
    ],
    components: {
        AnnotationLayer,

        RotationSelector,
        ScaleLine,
        DrawTools,

        AnnotationDetailsContainer,

        ImageInformation,
        DigitalZoom,
        ColorManipulation,
        LinkPanel,
        AnnotationsPanel,
        OntologyPanel,
        PropertiesPanel,
        FollowPanel,
        GuidedTour,

        SelectInteraction,
        DrawInteraction,
        ModifyInteraction
    },
    data() {
        return {
            minZoom: 0,
            
            projectedMousePosition: [0, 0],

            baseSource: null,

            layersMounted: false,
            viewMounted: false,
            routedAnnotation: null,

            intervalSavePosition: null,

            loading: true
        };
    },
    computed: {
        viewerWrapper() {
            return this.$store.state.images.viewers[this.idViewer];
        },
        imageWrapper() {
            return this.viewerWrapper.maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        projectionName() {
            return `CYTO-${this.image.id}`;
        },
        terms() {
            return this.imageWrapper.terms;
        },
        selectedLayers() {
            return this.imageWrapper.selectedLayers || [];
        },
        activePanel() {
            return this.imageWrapper.activePanel;
        },
        activeTool() {
            return this.imageWrapper.activeTool;
        },
        activeEditTool() {
            return this.imageWrapper.activeEditTool;
        },
        maxZoom() {
            return this.imageWrapper.maxZoom;
        },
        triggerUpdateSize() {
            return this.$store.state.images.triggerMapUpdateSize;
        },

        center: {
            get() {
                return this.imageWrapper.center;
            },
            set(value) {
                this.$store.commit("setCenter", {idViewer: this.idViewer, index: this.index, center: value});
            }
        },
        zoom: {
            get() {
                return this.imageWrapper.zoom;
            },
            set(value) {
                this.$store.commit("setZoom", {idViewer: this.idViewer, index: this.index, zoom: Number(value)});
            }
        },
        rotation: {
            get() {
                return this.imageWrapper.rotation;
            },
            set(value) {
                this.$store.commit("setRotation", {idViewer: this.idViewer, index: this.index, rotation: Number(value)});
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
        baseLayerURL() { // TODO: randomize + filter (see ULiege repo)
            return `${this.image.imageServerURL}&tileGroup={TileGroup}&x={x}&y={y}&z={z}
                &channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`;
        },

        colorManipulationOn() {
            return this.imageWrapper.hue != 0 || this.imageWrapper.lightness != 100 || this.imageWrapper.chroma != 100;
        },
        operation() {
            return operation;
        },
        lib() {
            return {
                ...constants,
                ...utilFunctions,
                hue: this.imageWrapper.hue,
                lightness: this.imageWrapper.lightness,
                chroma: this.imageWrapper.chroma
            };
        },

        layersToPreload() {
            if(this.routedAnnotation != null) {
                return [this.routedAnnotation.user];
            }
        },

        goToAnnotationTrigger() {
            return (this.routedAnnotation != null) && this.layersMounted && this.viewMounted;
        }
    },
    watch: {
        triggerUpdateSize() {
            this.$refs.map.updateSize();
        },

        async goToAnnotationTrigger(validTrigger) {
            if(validTrigger) {
                this.goToAnnotation();
            }
        },

        viewState() {
            this.savePosition();
        },
    },
    methods: {
        async setViewMounted() {
            await this.$refs.view.$createPromise; // wait for ol.View to be created
            this.viewMounted = true;
        },

        async setBaseSource() {
            await this.$refs.baseSource.$createPromise;
            this.baseSource = this.$refs.baseSource.$source;
        },

        async addOverviewMap() {
            await this.$refs.map.$createPromise; // wait for ol.Map to be created
            await this.$refs.baseLayer.$createPromise; // wait for ol.Layer to be created

            this.$refs.map.$map.addControl(new OverviewMap({
                collapsed: false,
                view: new View({projection: this.projectionName}),
                layers: [this.$refs.baseLayer.$layer]
            }));
        },

        async goToAnnotation() { // WARNING: will not work if annotation to display belongs to cluster after the view.fit
            let annot = this.routedAnnotation;
            let geometry = new WKT().readGeometry(annot.location);
            this.$refs.view.fit(geometry);

            // HACK: center set by view.fit() is incorrect => reset it manually
            if(geometry.getType() == "Point") {
                annot.centroid = {};
                annot.centroid.x = geometry.getFirstCoordinate()[0];
                annot.centroid.y = geometry.getFirstCoordinate()[1];
            }
            this.center = [annot.centroid.x, annot.centroid.y];
            // ---

            let retries = 0;
            let layer = null;
            let interval = setInterval(() => {
                if(layer == null) {
                    layer = this.selectedLayers.find(layer => layer.id == annot.user);
                }
                if(layer == null || layer.olSource == null) {
                    return;
                }

                let feature = layer.olSource.getFeatureById(annot.id);
                if(feature) {
                    clearInterval(interval);
                    this.$store.dispatch("selectFeature", {idViewer: this.idViewer, index: this.index, feature});
                }
                else if(retries == 5) {
                    clearInterval(interval);
                }
                retries++;
            }, 500);
        },

        togglePanel(panel) {
            this.$store.commit("togglePanel", {idViewer: this.idViewer, index: this.index, panel});
        },

        savePosition: _.debounce(async function() {
            if(this.$refs.view && this.viewMounted) {
                let extent = this.$refs.view.$view.calculateExtent(); // [minX, minY, maxX, maxY]
                await UserPosition.create({
                    image: this.image.id,
                    zoom: this.zoom,
                    // rotation: this.rotation, // TODO in core (https://github.com/cytomine/Cytomine-core/issues/1144)
                    bottomLeftX: Math.round(extent[0]),
                    bottomLeftY: Math.round(extent[1]),
                    bottomRightX: Math.round(extent[2]),
                    bottomRightY: Math.round(extent[1]),
                    topLeftX: Math.round(extent[0]),
                    topLeftY: Math.round(extent[3]),
                    topRightX: Math.round(extent[2]),
                    topRightY: Math.round(extent[3])
                });
            }
        }, 500)
    },
    async created() {
        if(getProj(this.projectionName) == null) { // if image opened for the first time
            let projection = createProj({code: this.projectionName, extent: this.extent});
            addProj(projection);
        }

        // remove all selected features in order to reselect them when they will be added to the map (otherwise,
        // issue with the select interaction)
        this.selectedLayers.forEach(layer => {
            this.$store.commit("removeLayerFromSelectedFeatures", {
                idViewer: this.idViewer,
                index: this.index,
                idLayer: layer.id,
                cache: true
            });
        });

        // TODO: this should be executed only once, for first image of viewer
        let idRoutedAnnot = this.$route.params.idAnnotation;
        if(idRoutedAnnot != null) {
            let annot = await Annotation.fetch(idRoutedAnnot);
            if(annot.image == this.image.id) {
                this.routedAnnotation = annot;
            }
        }

        this.intervalSavePosition = setInterval(() => this.savePosition(), 5000);

        this.image.recordConsultation();
        this.loading = false;
    },
    beforeDestroy() {
        clearInterval(this.intervalSavePosition);
    }
};
</script>

<style>
@import "~vuelayers/lib/style.css";
/* @import "~ol/ol.css"; */

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
    top: 10px;
    left: 50px;
    /*background: #eee;
    padding: 2px;
    border-radius: 3px;*/
}

.panels {
    background: #555;
    width: 40px;
    display: flex;
}

.panels ul {
    padding: 0;
    margin: 0;
}

.panels li {
    position: relative;
}

.panels > ul > li > a {
    position: relative;
    display: block;
    padding: 10px;
    padding-top: 7px;
    padding-bottom: 7px;
    font-size: 18px;
    color: #eee;
    border-bottom: 1px solid #222;
    text-decoration: none;
    text-align:center;
}

.panels > ul > li > a:hover {
    color: #fff;
}

.panels a.close {
    color: #ffc4c4;
}

.panels a.close:hover {
    color: #ff7070;
}

.panel-options table {
    background: none;
    width: 100%;
}

.panel-options {
    position: absolute;
    right: 38px;
    top: -20px;
    width: 300px;
    min-height: 100px;
    background: #f2f2f2;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    z-index: 100;
}

.panel-layers {
    top: unset;
    bottom: -70px;
}

.panel-ontology {
    top: unset;
    bottom: -50px;
}

.panel-properties, .panel-guided-tour, .panel-follow {
    top: unset;
    bottom: -20px;
}

.panel-options h1 {
    padding-top: 5px !important;
    padding-bottom: 15px !important;
}

/* ----- LIGHT ----- */

.panels > ul > li > a.active {
    background: #f2f2f2;
    color: #6c95c8;
}

/* ----- DARK ----- */

/* .panels > ul > li > a.active {
    background: #444;
    color: #a0c0e5;
}

.panel-options {
    background: #444;
}

.panel-options, .panel-options .label, .panel-options .table, .panel-options .table th, .panel-options .table strong {
    color: #dedede !important;
}

.panel-options .table td, .panel-options .table th {
    border-bottom: 1px solid #666;
}

.panel-options a {
    color: #a0c0e5;
}

.panel-options a:hover {
    color: #e9f2f3;
}

.panel-options select, .panel-options button {
    background-color: #5f5f5f !important;
    border: 1px solid #888 !important;
    color: #dedede !important;
}

.panel-options h1 {
    font-weight: bold;
    color: #e9f2f3;
} */

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
    box-shadow: 0px 0px 1px #777;
}

.ol-control button:hover {
    box-shadow: 0px 0px 1px black;
    cursor: pointer;
}

.ol-zoom-in {
    margin-bottom: 5px !important;
}

/* ----- Rotation selector ----- */
.rotation-selector-wrapper {
    position: absolute;
    left: .5em;
    top: 70px;
}

</style>
