<template>
    <div class="map-container" v-if="!loading" @click="isActiveMap = true">

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
                    v-if="baseSource != null && colorManipulationOn"
                    :sources="[baseSource]"
                    :operation="operation"
                    :lib="lib"
                />
            </vl-layer-image>

            <annotation-layer
                v-for="layer in selectedLayers"
                :key="'layer-'+layer.id"
                :idViewer="idViewer"
                :index="index"
                :layer="layer"
            />

            <select-interaction v-if="activeSelectInteraction" :idViewer="idViewer" :index="index" />
            <draw-interaction v-if="activeDrawInteraction" :idViewer="idViewer" :index="index" />
            <modify-interaction v-if="activeModifyInteraction" :idViewer="idViewer" :index="index" />

        </vl-map>

        <div v-if="configUI['project-tools-main']" class="draw-tools">
            <draw-tools :idViewer="idViewer" :index="index" />
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
                        <a @click="togglePanel('info')" :class="{active: activePanel == 'info'}">
                            <i class="fas fa-info"></i>
                        </a>
                        <information-panel class="panel-options" v-show="activePanel == 'info'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('digital-zoom')">
                        <a @click="togglePanel('digital-zoom')" :class="{active: activePanel == 'digital-zoom'}">
                            <i class="fas fa-search"></i>
                        </a>
                        <digital-zoom class="panel-options" v-show="activePanel == 'digital-zoom'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('link') && viewerWrapper.maps.length > 1">
                        <a @click="togglePanel('link')" :class="{active: activePanel == 'link'}">
                            <i class="fas fa-link"></i>
                        </a>
                        <link-panel class="panel-options" v-show="activePanel == 'link'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('colors')">
                        <a @click="togglePanel('colors')" :class="{active: activePanel == 'colors'}">
                            <i class="fas fa-adjust"></i>
                        </a>
                        <color-manipulation class="panel-options" v-show="activePanel == 'colors'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('image-layers')">
                        <a @click="togglePanel('layers')" :class="{active: activePanel == 'layers'}">
                            <i class="fas fa-copy"></i>
                        </a>
                        <annotations-panel class="panel-options" v-show="activePanel == 'layers'"
                            :idViewer="idViewer" :index="index" :layers-to-preload="layersToPreload"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('ontology') && terms.length > 0">
                        <a @click="togglePanel('ontology')" :class="{active: activePanel == 'ontology'}">
                            <i class="fas fa-hashtag"></i>
                        </a>
                        <ontology-panel class="panel-options" v-show="activePanel == 'ontology'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li  v-if="isPanelDisplayed('property')">
                        <a @click="togglePanel('properties')" :class="{active: activePanel == 'properties'}">
                            <i class="fas fa-tag"></i>
                        </a>
                        <properties-panel class="panel-options" v-show="activePanel == 'properties'"
                            :idViewer="idViewer" :index="index"
                        />
                    </li>

                    <li v-if="isPanelDisplayed('follow')">
                        <a @click="togglePanel('follow')" :class="{active: activePanel == 'follow'}">
                            <i class="fas fa-street-view"></i>
                        </a>
                        <follow-panel class="panel-options" v-show="activePanel == 'follow'"
                            :idViewer="idViewer" :index="index" :view="$refs.view"
                        />
                    </li>
                </template>
            </ul>
        </div>

        <div class="broadcast" v-if="imageWrapper.broadcast">
            <i class="fas fa-circle"></i> {{$t("live")}}
        </div>

        <rotation-selector class="rotation-selector-wrapper" :idViewer="idViewer" :index="index" />

        <scale-line :image="image" :zoom="zoom" :mousePosition="projectedMousePosition" />

        <annotation-details-container v-if="isPanelDisplayed('annotation-main')"
            :idViewer="idViewer" :index="index" :view="$refs.view"
        />

        <div class="custom-overview" ref="overview">
            <p class="image-name" :class="{hidden: overviewCollapsed}">
                <image-name :image="image" />
            </p>
        </div>
    </div>
</template>

<script>
import _ from "lodash";

import ImageName from "@/components/image/ImageName";
import AnnotationLayer from "./AnnotationLayer";
import RotationSelector from "./RotationSelector";
import ScaleLine from "./ScaleLine";
import DrawTools from "./DrawTools";

import InformationPanel from "./panels/InformationPanel";
import DigitalZoom from "./panels/DigitalZoom";
import ColorManipulation from "./panels/ColorManipulation";
import LinkPanel from "./panels/LinkPanel";
import AnnotationsPanel from "./panels/AnnotationsPanel";
import OntologyPanel from "./panels/OntologyPanel";
import PropertiesPanel from "./panels/PropertiesPanel";
import FollowPanel from "./panels/FollowPanel";

import AnnotationDetailsContainer from "./AnnotationDetailsContainer";

import SelectInteraction from "./interactions/SelectInteraction";
import DrawInteraction from "./interactions/DrawInteraction";
import ModifyInteraction from "./interactions/ModifyInteraction";

import {addProj, createProj, getProj} from "vuelayers/lib/ol-ext";

import View from "ol/View";
import OverviewMap from "ol/control/OverviewMap";
import {KeyboardPan, KeyboardZoom} from "ol/interaction";
import {noModifierKeys, targetNotEditable} from "ol/events/condition";
import WKT from "ol/format/WKT";

import {ImageConsultation, Annotation, AnnotationType, UserPosition} from "cytomine-client";

import {constLib, operation} from "@/utils/color-manipulation.js";

import constants from "@/utils/constants.js";

export default {
    name: "cytomine-image",
    props: {
        idViewer: String,
        index: Number
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
        AnnotationsPanel,
        OntologyPanel,
        PropertiesPanel,
        FollowPanel,

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
        configUI() {
            return this.$store.state.project.configUI;
        },
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
        isActiveMap: {
            get() {
                return this.viewerWrapper.activeMap == this.index;
            },
            set(value) {
                if(value) {
                    if(this.viewerWrapper) {
                        this.$store.commit("setActiveMap", {idViewer: this.idViewer, index: this.index});
                    }
                }
                else {
                    throw new Error("Cannot unset active map");
                }
            }
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
        baseLayerURLs() { // TODO: image filters (see ULiege repo)
            let params = `&tileGroup={TileGroup}&x={x}&y={y}&z={z}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`;
            return this.image.imageServerURLs.map(url => url + params);
        },

        colorManipulationOn() {
            return this.imageWrapper.brightness != 0 || this.imageWrapper.contrast != 0
                || this.imageWrapper.hue != 0 || this.imageWrapper.saturation != 0;
        },
        operation() {
            return operation;
        },
        lib() {
            return {
                ...constLib,
                brightness: this.imageWrapper.brightness,
                contrast: this.imageWrapper.contrast,
                saturation: this.imageWrapper.saturation,
                hue: this.imageWrapper.hue
            };
        },

        layersToPreload() {
            if(this.routedAnnotation != null) {
                return this.routedAnnotation.type === AnnotationType.REVIEWED ? [-1] : [this.routedAnnotation.user];
            }
        },

        overviewCollapsed() {
            return this.overview ? this.overview.getCollapsed() : null;
        },

        correction() {
            return ["correct-add", "correct-remove"].includes(this.activeEditTool);
        },
        activeSelectInteraction() {
            return this.activeTool === "select";
        },
        activeDrawInteraction() {
            return !this.activeSelectInteraction || this.correction;
        },
        activeModifyInteraction() {
            return this.activeSelectInteraction && this.activeEditTool != null && !this.correction;
        }
    },
    watch: {
        viewState() {
            this.savePosition();
        },
    },
    methods: {
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
                        return noModifierKeys(mapBrowserEvent) && targetNotEditable(mapBrowserEvent)
                            && this.isActiveMap && !mapBrowserEvent.originalEvent.target.classList.contains("ql-editor");
                    };
                }
            });
        },

        async viewMounted() {
            await this.$refs.view.$createPromise; // wait for ol.View to be created

            if(this.routedAnnotation != null) { // center view on annotation
                let annot = this.routedAnnotation;
                let geometry = new WKT().readGeometry(annot.location);
                this.$refs.view.fit(geometry, {padding: [10, 10, 10, 10], maxZoom: this.image.depth});

                // HACK: center set by view.fit() is incorrect => reset it manually
                this.center = (geometry.getType() == "Point") ? geometry.getFirstCoordinate()
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
            if(!this.isPanelDisplayed("overview")) {
                return;
            }

            await this.$refs.map.$createPromise; // wait for ol.Map to be created
            await this.$refs.baseLayer.$createPromise; // wait for ol.Layer to be created

            this.overview = new OverviewMap({
                collapsed: false,
                view: new View({projection: this.projectionName}),
                layers: [this.$refs.baseLayer.$layer],
                tipLabel: this.$t("overview"),
                target: this.$refs.overview
            });
            this.$refs.map.$map.addControl(this.overview);
        },

        togglePanel(panel) {
            this.$store.commit("togglePanel", {idViewer: this.idViewer, index: this.index, panel});
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
                        broadcast: this.imageWrapper.broadcast
                    });
                }
                catch(error) {
                    console.log(error);
                    this.$notify({type: "error", text: this.$t("notif-error-save-user-position")});
                }

                clearTimeout(this.timeoutSavePosition);
                this.timeoutSavePosition = setTimeout(this.savePosition, constants.SAVE_POSITION_IN_IMAGE_INTERVAL);
            }
        }, 500),

        isPanelDisplayed(panel) {
            return this.configUI[`project-explore-${panel}`];
        }
    },
    async created() {
        if(getProj(this.projectionName) == null) { // if image opened for the first time
            let projection = createProj({code: this.projectionName, units: "pixels", extent: this.extent});
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

        // Actions related to query parameters should be executed only once, for first image of viewer
        let firstIndexTargettedImage = this.viewerWrapper.maps.findIndex(map => {
            return map.imageInstance.id == this.$route.params.idImages;
        });
        if(this.index == firstIndexTargettedImage) {
            let idRoutedAnnot = this.$route.params.idAnnotation;
            if(idRoutedAnnot != null) {
                let annot = await Annotation.fetch(idRoutedAnnot);
                if(annot.image == this.image.id) {
                    this.routedAnnotation = annot;
                    if(this.$route.query.action === "comments") {
                        this.$store.commit("setShowComments", {idViewer: this.idViewer, index: this.index, annot});
                    }
                    this.$store.commit("setAnnotToSelect", {idViewer: this.idViewer, index: this.index, annot});
                }
            }
        }

        await new ImageConsultation({image: this.image.id}).save();
        this.loading = false;
    },
    mounted() {
        this.$eventBus.$on("updateMapSize", this.updateMapSize);
    },
    beforeDestroy() {
        this.$eventBus.$off("updateMapSize", this.updateMapSize);
        clearTimeout(this.timeoutSavePosition);
    }
};
</script>

<style lang="scss">
@import "~vuelayers/lib/style.css";

$backgroundPanelBar: #555;
$widthPanelBar: 38px;
$backgroundPanel: #f2f2f2;
$colorPanelLink: #eee;
$colorHoverPanelLink: white;
$colorBorderPanelLink: #222;
$colorOpenedPanelLink: #6c95c8;

$colorPositioningHelper: rgba(0, 0, 0, 0.5);
$sizePositioningHelperCenter: 50px;
$sizePositioningLineSize: 2px;

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
    z-index: 10;
}

.broadcast {
    position: absolute;
    right: 60px;
    top: 10px;
    text-transform: uppercase;
    font-weight: 600;
    background-color: #EE4242;
    color: white;
    padding: 5px;
    border-radius: 5px;
    border: 2px solid white;

    i.fas {
        margin-right: 5px;
    }
}

.panels {
    background: $backgroundPanelBar;
    display: flex;

    > ul {
        padding: 0;
        margin: 0;

        > li {
            position: relative;

            > a {
                position: relative;
                display: block;
                width: $widthPanelBar;
                padding: 10px;
                padding-top: 7px;
                padding-bottom: 7px;
                font-size: 18px;
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
    bottom: -20px;
    right: $widthPanelBar;
    width: 300px;
    min-height: 100px;
    background: $backgroundPanel;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    z-index: 100;

    h1 {
        padding-top: 5px !important;
        padding-bottom: 15px !important;
    }

    table {
        background: none;
        width: 100%;
    }
}

.panels li:nth-child(-n+7) .panel-options {
    bottom: -90px;
    min-height: 160px;
}

.panels li:nth-child(-n+3) .panel-options {
    top: -20px;
    bottom: unset;
    min-height: 100px;
}

.panels li:nth-child(4) .panel-options {
    top: -50px;
    bottom: unset;
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
    box-shadow: 0px 0px 1px #777;

    &:hover {
        box-shadow: 0px 0px 1px black;
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
    top: 70px;
}

.custom-overview {
    position: absolute;
    bottom: 0.5em;
    left: 0.5em;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    border-radius: 4px 4px 0px 0px;

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
