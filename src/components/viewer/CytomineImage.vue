<!-- TODO: re-render map when size of div changes (i.e. side panel toggled) > map.updateSize()-->
<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<!-- TODO: use VueX to restore state after page left -->
<!-- TODO: properties -->
<!-- TODO job templates -->
<!-- TODO: multi images -->
<!-- TODO annotation details -->
<!-- TODO shortcut keys (decide the ones to keep + help menu)-->
<template>
    <div class="map-container">
        <div class="map" id="map" @mousemove="updateMousePosition" @mousewheel="updateMousePosition" ref="map"></div>
        <div class="draw-tools" v-if="map != null">
            <draw-tools :map="map" :image="imageInstance"></draw-tools>
        </div>
        <div class="tools">
            <ul>
                <li><a @click="close()" class="close">
                    <i class="fa fa-times-circle"></i>
                </a></li>
                <li><a @click="toggleTool('info')" :class="{active: activeTool == 'info'}">
                        <i class="fa fa-info"></i>
                </a></li>
                <li><a @click="toggleTool('link')" :class="{active: activeTool == 'link'}">
                        <i class="fa fa-link"></i>
                </a></li>
                <li><a @click="toggleTool('colors')" :class="{active: activeTool == 'colors'}">
                        <i class="fa fa-sliders"></i>
                </a></li>
                <li><a @click="toggleTool('layers')" :class="{active: activeTool == 'layers'}">
                        <i class="fa fa-files-o"></i>
                </a></li>
                <li><a @click="toggleTool('guided-tour')" :class="{active: activeTool == 'guided-tour'}">
                        <i class="fa fa-map-signs"></i>
                </a></li>
            </ul>
        </div>

        <image-information class="tool-options tool-info" v-if="imageInstance != null" v-show="activeTool == 'info'"
            :image="imageInstance"></image-information>

        <div class="tool-options tool-link" v-show="activeTool == 'link'">
            Not yet implemented
        </div>

        <div class="tool-options tool-colors" v-show="activeTool == 'colors'">
            Not yet implemented
        </div>
        <!-- <color-manipulation class="tool-options tool-colors" v-if="map != null" v-show="activeTool == 'colors'"
            :map="map" :imageLayer="layer"></color-manipulation> -->

        <annotations-panel class="tool-options tool-layers" v-if="map != null" v-show="activeTool == 'layers'"
            :image="imageInstance" :map="map"></annotations-panel>

        <guided-tour class="tool-options tool-guided-tour" v-if="view != null" v-show="activeTool == 'guided-tour'"
            :view="view"></guided-tour>

        <scale-line v-if="zoom != null"
            :image="imageInstance" :currentZoom="zoom" :mousePosition="projectedMousePosition"></scale-line>
    </div>
</template>

<script>
import ImageInformation from "./ImageInformation";
import ColorManipulation from "./ColorManipulation";
import AnnotationsPanel from "./AnnotationsPanel";
import GuidedTour from "./GuidedTour";
import ScaleLine from "./ScaleLine";
import DrawTools from "./DrawTools";

import {Map, View} from "ol";
import {Zoomify} from "ol/source";
import {Tile as TileLayer} from "ol/layer";
import Projection from "ol/proj/Projection";
import {defaults as defaultControls, OverviewMap} from "ol/control";

import {ImageInstance, AbstractImage} from "cytomine-client";

export default {
    name: "cytomine-image",
    components: {
        ImageInformation,
        ColorManipulation,
        AnnotationsPanel,
        GuidedTour,
        ScaleLine,
        DrawTools
    },
    data() {
        return {
            imageInstance: null,
            map: null,
            layer: null,
            activeTool: null,
            projectedMousePosition: [0, 0]
        };
    },
    computed: {
        view() {
            if(this.map != null) {
                return this.map.getView();
            }
        },
        zoom() {
            if(this.view != null) {
                return this.view.getZoom();
            }
        }
    },
    methods: {
        toggleTool(tool) {
            if(this.activeTool === tool) {
                this.activeTool = null;
            }
            else {
                this.activeTool = tool;
            }
        },

        updateMousePosition(event) {
            if(this.map != null) {
                let rect = this.$refs.map.getBoundingClientRect();
                let mousePosition = [event.clientX - rect.left, event.clientY - rect.top];
                this.projectedMousePosition = this.map.getCoordinateFromPixel(mousePosition);
            }
        },

        close() {
            this.$destroy();
            this.$router.push("/");
        }

    },
    async created() {
        this.imageInstance = await ImageInstance.fetch(this.$route.params.id);
        let imageServerURLs = await new AbstractImage({id: this.imageInstance.baseImage}).fetchImageServers();
        let imageServerURL = imageServerURLs[0];

        let extent = [0, 0, this.imageInstance.width, this.imageInstance.height];
        let projection = new Projection({code: "CYTO", extent});

        let view = new View({
            center: [this.imageInstance.width/2, this.imageInstance.height/2],
            minZoom: 2,
            maxZoom: this.imageInstance.depth,
            projection,
            zoom: 2,
            extent: extent
        });

        this.layer = new TileLayer({
            title: "Image",
            source: new Zoomify({
                url: `${imageServerURL}&tileGroup={TileGroup}&x={x}&y={y}&z={z}
                    &channels=0&layer=0&timeframe=0&mimeType=${this.imageInstance.mime}`,
                size: [this.imageInstance.width, this.imageInstance.height],
                extent
            })
        });

        let overview = new OverviewMap({
            layers: [this.layer],
            collapsed: false,
            view: new View({projection})
        });


        this.map = new Map({
            target: "map",
            controls: defaultControls().extend([overview]),
            loadTilesWhileInteracting: true,
            layers: [this.layer],
            view
        });
    }
};
</script>

<style>
@import "~ol/ol.css";

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
    /*background: #555;
    padding: 2px;
    border-radius: 3px;*/
}

.tools {
    background: #555;
    width: 40px;
    display: flex;
}

.tools ul {
    padding: 0;
    margin: 0;
}

.tools li a {
    position: relative;
    display: block;
    padding: 10px;
    font-size: 20px;
    color: #eee;
    border-bottom: 1px solid #222;
    text-decoration: none;
    text-align:center;
}

.tools a:hover {
    color: #fff;
}

.tools a.close {
    color: #ffc4c4;
}

.tools a.close:hover {
    color: #ff7070;
}

.tool-guided-tour .buttons {
    margin-top: 10px;
    text-align: center;
}

.tool-options table {
    background: none;
    width: 100%;
}

/* ----- LIGHT ----- */

/* .tools {
    padding-top: 0px;
} */

.tools li a.active {
    background: #f2f2f2;
    color: #6c95c8;
}

.tool-options {
    position: absolute;
    right: 40px;
    width: 300px;
    min-height: 100px;
    background: #f2f2f2;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    z-index: 100;
}

.tool-info {
    top: 20px;
}

.tool-link {
    top: 40px;
}

.tool-colors {
    top: 80px;
}

.tool-layers {
    top: 100px;
    font-size: 0.9em;
}

.tool-guided-tour {
    top: 150px;
}

.tool-guided-tour .buttons {
    margin-top: 10px;
    text-align: center;
}

.tool-options h1 {
    padding-top: 5px !important;
    padding-bottom: 15px !important;
}

/* ----- DARK ----- */

/* .tools li a.active {
    background: #444;
    color: #a0c0e5;
}

.tool-options {
    position: absolute;
    right: 40px;
    width: 300px;
    min-height: 100px;
    background: #444;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    color: #dedede;
}

.tool-options .table {
    color: #dedede !important;
}

.tool-options .table th {
    color: #dedede !important;
}

.tool-options .table td, .tool-options .table th {
    border-bottom: 1px solid #888;
}

.tool-options .table strong {
    color: #dedede !important;
}

.tool-options a {
    color: #a0c0e5;
}

.tool-options a:hover {
    color: #e9f2f3;
}

.tool-options select, .tool-options button {
    background-color: #5f5f5f !important;
    border: 1px solid #888 !important;
    color: #dedede !important;
}

.tool-info {
    top: 0px;
}

.tool-link {
    top: 20px;
}

.tool-sliders {
    top: 60px;
}

.tool-layers {
    top: 70px;
    font-size: 0.9em;
}

.tool-guided-tour {
    top: 130px;
}

.tool-options h1 {
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
