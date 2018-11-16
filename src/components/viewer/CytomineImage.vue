<!-- TODO: re-render map when size of div changes (i.e. side panel toggled) > map.updateSize()-->
<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<!-- TODO: properties -->
<!-- TODO job templates -->
<!-- TODO: multi images -->
<!-- TODO annotation details -->
<!-- TODO shortcut keys (decide the ones to keep + help menu)-->
<template>
    <div class="map-container">

        <vl-map :data-projection="projectionName"
                :load-tiles-while-animating="true"
                :load-tiles-while-interacting="true"
                @pointermove="projectedMousePosition = $event.coordinate"
                v-if="!loading">

            <vl-view :center.sync="center"
                     :zoom.sync="zoom"
                     :rotation.sync="rotation"
                     :max-zoom="maxZoom"
                     :min-zoom="minZoom"
                     :extent="extent"
                     :projection="projectionName">
            </vl-view>

            <vl-layer-tile :extent="extent">
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

        <!-- <div class="map" id="map" @mousemove="updateMousePosition" @mousewheel="updateMousePosition" ref="map"></div> -->
        
        <div class="draw-tools" v-if="imageInstance">
            <draw-tools :image="imageInstance"></draw-tools>
        </div>

        <div class="panels">
            <ul>
                <li><a @click="close()" class="close">
                    <i class="fa fa-times-circle"></i>
                </a></li>
                <li><a @click="togglePanel('info')" :class="{active: activePanel == 'info'}">
                        <i class="fa fa-info"></i>
                </a></li>
                <li><a @click="togglePanel('link')" :class="{active: activePanel == 'link'}">
                        <i class="fa fa-link"></i>
                </a></li>
                <li><a @click="togglePanel('colors')" :class="{active: activePanel == 'colors'}">
                        <i class="fa fa-sliders"></i>
                </a></li>
                <li><a @click="togglePanel('layers')" :class="{active: activePanel == 'layers'}">
                        <i class="fa fa-files-o"></i>
                </a></li>
                <li><a @click="togglePanel('guided-tour')" :class="{active: activePanel == 'guided-tour'}">
                        <i class="fa fa-map-signs"></i>
                </a></li>
            </ul>
        </div>

        <image-information class="panel-options panel-info" v-if="imageInstance != null" v-show="activePanel == 'info'"
            :image="imageInstance"></image-information>

        <div class="panel-options panel-link" v-show="activePanel == 'link'">
            Not yet implemented
        </div>

        <div class="panel-options panel-colors" v-show="activePanel == 'colors'">
            Not yet implemented
        </div>
        <!-- <color-manipulation class="panel-options panel-colors" v-if="map != null" v-show="activePanel == 'colors'"
            :map="map" :imageLayer="layer"></color-manipulation> -->

        <annotations-panel class="panel-options panel-layers" v-if="imageInstance != null" v-show="activePanel == 'layers'"
            :image="imageInstance"></annotations-panel>

        <!-- <guided-tour class="panel-options panel-guided-tour" v-if="view != null" v-show="activePanel == 'guided-tour'"
            :view="view"></guided-tour> -->

        <!-- <scale-line v-if="zoom != null"
            :image="imageInstance" :currentZoom="zoom" :mousePosition="projectedMousePosition"></scale-line> -->

        <annotation-details-container v-if="imageInstance != null" :image="imageInstance">
        </annotation-details-container>
    </div>
</template>

<script>
import { mapState } from "vuex";

import AnnotationLayer from "./AnnotationLayer";
import ScaleLine from "./ScaleLine";
import DrawTools from "./DrawTools";

import ImageInformation from "./panels/ImageInformation";
import AnnotationsPanel from "./panels/AnnotationsPanel";
import GuidedTour from "./panels/GuidedTour";

import AnnotationDetailsContainer from "./AnnotationDetailsContainer";

import SelectInteraction from "./interactions/SelectInteraction";
import DrawInteraction from "./interactions/DrawInteraction";
import ModifyInteraction from "./interactions/ModifyInteraction";

import {addProj, createProj} from "vuelayers/lib/ol-ext";

import {ImageInstance, AbstractImage} from "cytomine-client";

export default {
    name: "cytomine-image",
    components: {
        AnnotationLayer,
        ScaleLine,
        DrawTools,

        AnnotationDetailsContainer,

        ImageInformation,
        AnnotationsPanel,
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
        selectedLayers() {
            return this.imageWrapper.selectedLayers;
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
        maxZoom() {
            if(this.imageInstance != null) {
                return this.imageInstance.depth;
            }
        },

        ...mapState({images: state => state.images.images})
    },
    methods: {
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
            this.selectedLayers.forEach(layer => {
                this.$store.commit("removeLayerFromSelectedFeatures", {idImage: this.idImage, idLayer: layer.id, cache: true});
            });
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

.panels li a {
    position: relative;
    display: block;
    padding: 10px;
    font-size: 20px;
    color: #eee;
    border-bottom: 1px solid #222;
    text-decoration: none;
    text-align:center;
}

.panels a:hover {
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

.panels li a.active {
    background: #f2f2f2;
    color: #6c95c8;
}

.panel-options {
    position: absolute;
    right: 40px;
    width: 300px;
    min-height: 100px;
    background: #f2f2f2;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    z-index: 100;
}

.panel-info {
    top: 20px;
}

.panel-link {
    top: 40px;
}

.panel-colors {
    top: 80px;
}

.panel-layers {
    top: 100px;
    font-size: 0.9em;
}

.panel-guided-tour {
    top: 150px;
}

.panel-guided-tour .buttons {
    margin-top: 10px;
    text-align: center;
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
