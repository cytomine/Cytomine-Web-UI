<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<!-- TODO: properties -->
<!-- TODO job templates -->
<!-- TODO: multi images -->
<!-- TODO shortcut keys (decide the ones to keep + help menu)-->
<!-- TODO: rotations - allow user to enter value -->
<!-- TODO: allow to select term to associate to newly created annotations -->
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
                     @mounted="viewMounted = true"
                     ref="view">
            </vl-view>

            <vl-layer-tile :extent="extent" @mounted="addOverviewMap" ref="baseLayer">
                <vl-source-zoomify :projection="projectionName"
                                   :url="baseLayerURL"
                                   :size="imageSize"
                                   :extent="extent"
                                   :key="baseLayerURL">
                </vl-source-zoomify>
            </vl-layer-tile>

            <annotation-layer v-for="layer in selectedLayers" :key="'layer-'+layer.id"
                              :image="imageInstance" 
                              :user-layer="layer">
            </annotation-layer>

            <select-interaction v-if="activeTool == 'select'" :image="imageInstance">
            </select-interaction>

            <draw-interaction v-if="activeTool != 'select'" :image="imageInstance">
            </draw-interaction>

            <modify-interaction v-if="activeTool == 'select' && activeEditTool != null" :image="imageInstance">
            </modify-interaction>

        </vl-map>

        <div class="draw-tools">
            <draw-tools :image="imageInstance"></draw-tools>
        </div>

        <div class="panels">
            <ul>
                <li>
                    <a @click="close()" class="close">
                        <i class="fa fa-times-circle"></i>
                    </a>
                </li>

                <li>
                    <a @click="togglePanel('info')" :class="{active: activePanel == 'info'}">
                        <i class="fa fa-info"></i>
                    </a>
                    <image-information class="panel-options panel-info" v-show="activePanel == 'info'"
                        :image="imageInstance"></image-information>
                </li>

                <li>
                    <a @click="togglePanel('digital-zoom')" :class="{active: activePanel == 'digital-zoom'}">
                        <i class="fa fa-search"></i>
                    </a>
                    <digital-zoom class="panel-options panel-digital-zoom"
                        v-show="activePanel == 'digital-zoom'" :image="imageInstance"></digital-zoom>
                </li>

                <li>
                    <a @click="togglePanel('link')" :class="{active: activePanel == 'link'}">
                        <i class="fa fa-link"></i>
                    </a>
                    <div class="panel-options panel-link" v-show="activePanel == 'link'">
                        Not yet implemented
                    </div>
                </li>

                <li>
                    <a @click="togglePanel('colors')" :class="{active: activePanel == 'colors'}">
                        <i class="fa fa-sliders"></i>
                    </a>
                    <div class="panel-options panel-colors" v-show="activePanel == 'colors'">
                        Not yet implemented
                    </div>
                    <!-- <color-manipulation class="panel-options panel-colors" v-if="map != null" v-show="activePanel == 'colors'"
                        :map="map" :imageLayer="layer"></color-manipulation> -->
                </li>

                <li>
                    <a @click="togglePanel('layers')" :class="{active: activePanel == 'layers'}">
                        <i class="fa fa-files-o"></i>
                    </a>
                    <annotations-panel class="panel-options panel-layers" v-show="activePanel == 'layers'"
                        :image="imageInstance" :layers-to-preload="layersToPreload" @hook:mounted="layersMounted = true">
                    </annotations-panel>
                </li>

                <li v-if="terms.length > 0">
                    <a @click="togglePanel('ontology')" :class="{active: activePanel == 'ontology'}">
                        <i class="fa fa-binoculars"></i>
                    </a>
                    <ontology-panel class="panel-options panel-ontology" v-show="activePanel == 'ontology'"
                        :image="imageInstance"></ontology-panel>
                </li>

                <li>
                    <a @click="togglePanel('guided-tour')" :class="{active: activePanel == 'guided-tour'}">
                        <i class="fa fa-map-signs"></i>
                    </a>
                    <guided-tour class="panel-options panel-guided-tour" v-show="activePanel == 'guided-tour'"
                        :view="$refs.view"></guided-tour>
                </li>
            </ul>
        </div>

        <scale-line :image="imageInstance" :mousePosition="projectedMousePosition"></scale-line>

        <annotation-details-container :image="imageInstance"></annotation-details-container>
    </div>
</template>

<script>
import { mapState } from "vuex";

import AnnotationLayer from "./AnnotationLayer";
import ScaleLine from "./ScaleLine";
import DrawTools from "./DrawTools";

import ImageInformation from "./panels/ImageInformation";
import DigitalZoom from "./panels/DigitalZoom";
import AnnotationsPanel from "./panels/AnnotationsPanel";
import OntologyPanel from "./panels/OntologyPanel";
import GuidedTour from "./panels/GuidedTour";

import AnnotationDetailsContainer from "./AnnotationDetailsContainer";

import SelectInteraction from "./interactions/SelectInteraction";
import DrawInteraction from "./interactions/DrawInteraction";
import ModifyInteraction from "./interactions/ModifyInteraction";

import {addProj, createProj} from "vuelayers/lib/ol-ext";

import View from "ol/View";
import OverviewMap from "ol/control/OverviewMap";
import WKT from "ol/format/WKT";

import {ImageInstance, AbstractImage, Annotation} from "cytomine-client";

export default {
    name: "cytomine-image",
    components: {
        AnnotationLayer,
        ScaleLine,
        DrawTools,

        AnnotationDetailsContainer,

        ImageInformation,
        DigitalZoom,
        AnnotationsPanel,
        OntologyPanel,
        GuidedTour,

        SelectInteraction,
        DrawInteraction,
        ModifyInteraction
    },
    data() {
        return {
            minZoom: 2, // compute in smarter way?
            
            projectionName: "CYTO",
            projectedMousePosition: [0, 0],

            layersMounted: false,
            viewMounted: false,
            routedAnnotation: null,

            loading: true
        };
    },
    computed: {
        idImage() {
            return this.$route.params.idImage;
        },
        imageWrapper() {
            return this.images[this.idImage] || {};
        },
        imageInstance() {
            return this.imageWrapper.imageInstance;
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
                this.$store.commit("setCenter", {idImage: this.idImage, center: value});
            }
        },
        zoom: {
            get() {
                return this.imageWrapper.zoom;
            },
            set(value) {
                this.$store.commit("setZoom", {idImage: this.idImage, zoom: Number(value)});
            }
        },
        rotation: {
            get() {
                return this.imageWrapper.rotation;
            },
            set(value) {
                this.$store.commit("setRotation", {idImage: this.idImage, rotation: Number(value)});
            }
        },

        extent() {
            if(this.imageInstance != null) {
                return [0, 0, this.imageInstance.width, this.imageInstance.height];
            }
        },
        imageSize() {
            if(this.imageInstance != null) {
                return [this.imageInstance.width, this.imageInstance.height];
            }
        },
        baseLayerURL() { // TODO: randomize + filter (see ULiege repo)
            if(this.imageInstance != null) {
                return `${this.imageInstance.imageServerURL}&tileGroup={TileGroup}&x={x}&y={y}&z={z}
                    &channels=0&layer=0&timeframe=0&mimeType=${this.imageInstance.mime}`;
            }
        },

        layersToPreload() {
            if(this.routedAnnotation != null) {
                return [this.routedAnnotation.user];
            }
        },

        goToAnnotationTrigger() {
            return (this.routedAnnotation != null) && this.layersMounted && this.viewMounted;
        },

        ...mapState({images: state => state.images.images})
    },
    watch: {
        triggerUpdateSize() {
            this.$refs.map.updateSize();
        },

        async goToAnnotationTrigger(val) {
            if(val) {
                await this.$refs.view.$createPromise; // wait for ol.View to be created
                this.goToAnnotation();
            }
        }
    },
    methods: {
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
                    this.$store.dispatch("selectFeature", {idImage: this.idImage, feature});
                }
                else if(retries == 5) {
                    clearInterval(interval);
                }
                retries++;
            }, 500);
        },

        togglePanel(panel) {
            this.$store.commit("togglePanel", {idImage: this.idImage, panel});
        },

        close() {
            this.$store.commit("removeImage", this.imageInstance.id);
            this.$router.push("/"); // TODO: change
        },
    },
    async mounted() {
        if(this.imageInstance == null) { // if image not in store
            let imageInstance = await ImageInstance.fetch(this.idImage);

            let imageServerURLs = await new AbstractImage({id: imageInstance.baseImage}).fetchImageServers();
            imageInstance.imageServerURL = imageServerURLs[0];

            let cytoProjection = createProj({
                code: this.projectionName, 
                extent: [0, 0, imageInstance.width, imageInstance.height]
            });
            addProj(cytoProjection);

            await this.$store.dispatch("addImage", {image: imageInstance});
        }
        else {
            // remove all selected features in order to reselect them when they will be added to the map (otherwise,
            // issue with the select interaction)
            this.selectedLayers.forEach(layer => {
                this.$store.commit("removeLayerFromSelectedFeatures", {
                    idImage: this.idImage,
                    idLayer: layer.id,
                    cache: true
                });
            });
        }

        let idRoutedAnnot = this.$route.params.idAnnotation;
        if(idRoutedAnnot != null) {
            this.routedAnnotation = await Annotation.fetch(idRoutedAnnot);
        }

        this.loading = false;
    }
};
</script>

<style>
@import "~vuelayers/lib/style.css";
/* @import "~ol/ol.css"; */

.map-container {
    width: 100%;
    height: 100%;
    display:flex;
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
    font-size: 20px;
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

.panel-guided-tour .buttons {
    margin-top: 10px;
    text-align: center;
}

.panel-options table {
    background: none;
    width: 100%;
}

/* ----- LIGHT ----- */

/* .panels {
    padding-top: 0px;
} */

.panels > ul > li > a.active {
    background: #f2f2f2;
    color: #6c95c8;
}

.panel-options {
    position: absolute;
    right: 40px;
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
    bottom: -40px;
}

.panel-ontology, .panel-guided-tour {
    top: unset;
    bottom: -20px;
}

.panel-options h1 {
    padding-top: 5px !important;
    padding-bottom: 15px !important;
}

/* ----- DARK ----- */

/* .panels li a.active {
    background: #444;
    color: #a0c0e5;
}

.panel-options {
    position: absolute;
    right: 40px;
    width: 300px;
    min-height: 100px;
    background: #444;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    color: #dedede;
}

.panel-options .table {
    color: #dedede !important;
}

.panel-options .table th {
    color: #dedede !important;
}

.panel-options .table td, .panel-options .table th {
    border-bottom: 1px solid #888;
}

.panel-options .table strong {
    color: #dedede !important;
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

.panel-info {
    top: 0px;
}

.panel-link {
    top: 20px;
}

.panel-sliders {
    top: 60px;
}

.panel-layers {
    top: 70px;
    font-size: 0.9em;
}

.panel-guided-tour {
    top: 130px;
}

.panel-options h1 {
    padding-top: 5px !important;
    padding-bottom: 15px !important;
    font-weight: bold;
    color: #e9f2f3;
} */

/* ----- CUSTOM STYLE FOR OL CONTROLS ----- */

.ol-zoom, .ol-rotate {
    background: none !important;
}

.ol-rotate {
    top: 70px;
    left: .5em;
}

.ol-viewport button {
    background: white !important;
    color: black !important;
    border-radius: 2px !important;
    box-shadow: 0px 0px 1px #777;
}

.ol-viewport button:hover {
    box-shadow: 0px 0px 1px black;
    cursor: pointer;
}

.ol-zoom-in {
    margin-bottom: 5px !important;
}

</style>
