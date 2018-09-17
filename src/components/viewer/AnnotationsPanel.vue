<!-- TODO: handle review mode -->
<template>
<div class="layers">
    <h1>{{ $t("annotation-layers") }}</h1>
    <b-field>
        <b-select :placeholder="$t('select-layer')" size="is-small" v-model="selectedLayer">
            <option v-for="layer in unselectedLayers" :value="layer" :key="layer.id">
                {{ layerName(layer) }}
            </option>
        </b-select>
        <button class="button is-small" @click="addLayer()" :disabled="selectedLayer == null">{{ $t("add") }}</button>
    </b-field>
    <table class="table layers-table">
        <thead>
            <tr>
                <th class="checkbox-column"><span class="fa fa-eye"></span></th>
                <th class="checkbox-column"><span class="fa fa-pencil"></span></th>
                <th class="checkbox-column"><span class="fa fa-lock"></span></th>
                <th class="name-column"></th>
                <th class="checkbox-column"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(layer, index) in selectedLayers" :key="layer.id">
                <td class="checkbox-column">
                    <input type="checkbox" v-model="layer.displayed" @change="updateLayerVisibility(layer)">
                </td>
                <td class="checkbox-column">
                    <input type="checkbox" v-model="layer.drawOn">
                </td>
                <td class="checkbox-column">
                    <input type="checkbox" v-model="layer.locked">
                </td>
                <td class="name-column">
                    {{ layerName(layer) }}
                </td>
                <td class="checkbox-column">
                    <button class="button is-small" @click="removeLayer(index)">
                        <span class="fa fa-times"></span>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="opacity">
        <label>{{ $t("layers-opacity") }}</label>
        <input class="slider is-fullwidth is-small" v-model="layersOpacity" step="0.05" min="0" max="1" type="range">
    </div>

    <template v-if="terms.length > 0">
    <h3>{{ $t("terms") }}</h3>

    <table class="table">
        <thead>
            <tr>
                <th class="checkbox-column"><span class="fa fa-eye"></span></th>
                <th class="checkbox-column"></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="term in terms" :key="term.id">
                <td class="checkbox-column">
                    <input type="checkbox" v-model="term.displayed">
                </td>
                <td class="checkbox-column">
                    <div class="color-preview" :style="{background: term.color}"></div>
                </td>
                <td class="name-column">
                    {{term.name}}
                </td>
            </tr>
            <tr>
                <td colspan="3"></td>
            </tr>
            <tr>
                <td class="checkbox-column">
                    <input type="checkbox" v-model="displayNoTerm">
                </td>
                <td class="checkbox-column"></td>
                <td class="name-column">
                    {{ $t("no-term") }}
                </td>
            </tr>
        </tbody>
    </table>
    </template>
</div>
</template>

<script>
import { mapState } from "vuex";

import WKT from "ol/format/WKT";
import {Vector as VectorSource} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import {Style, Fill, Stroke, Circle, Text} from "ol/style";
import {asArray as hexToRgb} from "ol/color";

import {Project, AnnotationCollection, TermCollection} from "cytomine-client";

export default {
    name: "annotations-panel",
    props: [
        "map",
        "image"
    ],
    data() {
        return {
            layers: [], // Array<User> (representing user layers)
            layersOpacity: 0.5,
            defaultStyle: new Style(),
            editStyles: [],
            defaultStroke: new Stroke(),
            terms: [], // Array<Term>
            displayNoTerm: true,
            selectedLayers: [], // Array<User> (representing user layers)
            selectedLayer: null,
        };
    },
    computed: {
        unselectedLayers() {
            return this.layers.filter(layer => !this.selectedLayers.includes(layer));
        },
        currentUserLayer() {
            if(this.layers != null) {
                return this.layers.find(layer => layer.id == this.currentUser.id);
            }
        },
        view() {
            return this.map.getView();
        },
        termsToDisplay() {
            return this.terms.reduce(function(idTerms, term) {
                if(term.displayed) {
                    idTerms.push(term.id);
                }
                return idTerms;
            }, []);
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    watch: {
        layersOpacity() {
            this.terms.forEach(term => this.changeOpacity(term.olStyle, Number(this.layersOpacity)));
            this.changeOpacity(this.defaultStyle, Number(this.layersOpacity));
            let colorStroke = this.defaultStroke.getColor();
            colorStroke[3] = this.layersOpacity;

            this.forceRefresh();
        },
        termsToDisplay() {
            this.forceRefresh();
        },
        displayNoTerm() {
            this.forceRefresh();
        }
    },
    methods: {
        forceRefresh() { // force rerendering of the layers following a style update
            this.selectedLayers.forEach(layer => layer.olLayer.changed());
        },

        layerName(layer) {
            let name = "";
            if(layer.algo) {
                let date = this.$options.filters.moment(Number(layer.created), "DD/MM/YYYY, HH:mm");
                name = `${layer.softwareName} - ${date}`;
            }
            else {
                name = `${layer.firstname} ${layer.lastname} (${layer.username})`;
            }

            return `${name} (${layer.countAnnotation})`;
        },

        createFeatures(annotations) {
            let format = new WKT();
            let features = annotations.map(annot => {
                let feature = format.readFeature(annot.location);
                feature.setId(annot.id); // TODO: solve backend issue with kmeans generated ID (the same ID is used for different clusters when bbox changes)
                feature.set("annot", annot);
                return feature;
            });
            return features;
        },

        genLoader(layer) {
            let image = this.image;
            let createFeatures = this.createFeatures;

            return async function(extent, resolution) {
                this.resolution = resolution;
                let bbox = [0, 0, image.width, image.height];
                if(isFinite(extent[0])) {
                    bbox = extent.join();
                }
                let annots = await new AnnotationCollection({
                    user: layer.id, image: image.id, bbox, showWKT: true, showTerm: true, kmeans: true
                }).fetch();

                if(annots.length > 0) {
                    if(annots.get(0).count) { // if a result has a count property, it means the annotations were clustered
                        this.clustered = true;
                        if(this.minResolutionClusters == null || resolution < this.minResolutionClusters) {
                            this.minResolutionClusters = resolution; // TODO: add function in backend returning the resolution at which clustering stops ?
                        }
                    }
                    else {
                        this.clustered = false;
                        if(this.maxResolutionNoClusters == null || resolution > this.maxResolutionNoClusters) {
                            this.maxResolutionNoClusters = resolution;
                        }
                    }
                }

                let features = createFeatures(annots.array);
                this.addFeatures(features);
            };
        },

        isCluster(feature) { // is the feature a cluster?
            let annot = feature.get("annot");
            return annot.count != null;
        },

        styleFunction(feature) {
            let annot = feature.get("annot");
            if(annot == null) {
                return;
            }

            let isCluster = this.isCluster(feature);

            // QUESTION: decide whether it is better to filter with this method, or to force source refresh and query only appropriate annotations
            // QUESTION: what to do with clusters (returned count does not take into account the selected terms) ?
            // Possible solutions:
            // 1. in backend, for clusters, send array with composition of cluster (x for term 1, y for term 2, z for term1-2)
            // 2. force source refresh every time the list of terms to display is updated
            // 3. add parameter allowing to provide the terms to take into account in kmeans (but only for kmeans)
            if(!isCluster) {
                let hasTerms = (annot.term.length > 0);
                let hasTermsToDisplay = annot.term.some(term => this.termsToDisplay.includes(term));

                if((hasTerms && !hasTermsToDisplay) || (!hasTerms && !this.displayNoTerm)) {
                    return null; // do not display annotation
                }
            }

            let styles = [];

            // Style based on term
            if(annot.term.length == 1) {
                let termToFind = annot.term[0];
                styles.push(this.terms.find(term => term.id == termToFind).olStyle);
            }
            else {
                styles.push(this.defaultStyle);
            }

            // Style for clusters
            if(isCluster) {
                styles.push(this.createTextStyle(annot.count.toString()));
            }

            // Styles for selected elements // TODO: manage selectedFeature in vueX?
            /*if(this.selectedFeatures.getArray().includes(feature)) {
                styles.push(...this.editStyles);
            }*/

            return styles;
        },

        filterFunction(feature) {
            return !this.isCluster(feature);
        },

        addLayer(layer = this.selectedLayer) {
            layer.displayed = true;
            layer.drawOn = (layer.id == this.currentUser.id);
            layer.locked = false;
            this.selectedLayers.push(layer);
            this.selectedLayer = null;

            let strategy = function(extent, resolution) {
                if(this.resolution && this.clustered != null && // if some features have already been loaded
                ((resolution != this.resolution && this.clustered) // zoom modification while clustering is performed
                || (resolution > this.resolution && !this.clustered && resolution > this.maxResolutionNoClusters))) { // re-cluster
                    this.clear();
                    // TODO: handle selectedElement ; otherwise, it remains displayed and selected even though it should no longer be displayed
                    // TODO: reselect correct element based on ID ?
                }
                return [extent];
            };

            let source = new VectorSource({
                strategy,
                loader: this.genLoader(layer)
            });

            let vectorLayer = new VectorLayer({
                id: layer.id,
                source,
                extent: [0, 0, this.image.width, this.image.height],
                visible: layer.displayed,
                style: this.styleFunction,
                updateWhileInteracting: true,
                drawOn: layer.drawOn
            });
            this.map.addLayer(vectorLayer);

            layer.olLayer = vectorLayer;
        },

        removeLayer(index) {
            this.map.removeLayer(this.selectedLayers[index].olLayer);
            this.selectedLayers[index].olLayer = null;
            this.selectedLayers.splice(index, 1);
        },

        updateLayerVisibility(layer) {
            layer.olLayer.setVisible(layer.displayed);
        },

        async loadLayers() {
            let layersPromise = new Project({id: this.image.project}).fetchUserLayers(this.image.id);
            let indexLayersPromise = this.image.fetchAnnotationsIndex();

            let collectionLayers = await layersPromise;
            let indexLayers = await indexLayersPromise;
            this.layers = collectionLayers.array;
            this.layers.forEach(layer => { // TODO: externalize that in client ?
                let indexLayer = indexLayers.find(index => index.user == layer.id);
                if(indexLayer == null) {
                    layer.countAnnotation = 0;
                    layer.countReviewedAnnotation = 0;
                }
                else {
                    layer.countAnnotation = indexLayer.countAnnotation;
                    layer.countReviewedAnnotation = indexLayer.countReviewedAnnotation;
                }
            });
        },

        async loadTerms() {
            let terms = await TermCollection.fetchWithFilter("project", this.image.project);
            terms.array.forEach(term => {
                term.olStyle = this.createColorStyle(term.color);
                term.displayed = true;
            });
            this.terms.push(...terms.array); // cannot use this.terms = terms.array because we want vue to track the changes afterwards
        },

        createColorStyle(color) {
            let colorArray = hexToRgb(color);
            colorArray[3] = this.layersOpacity;
            let fill = new Fill({color: colorArray});
            return new Style({
                fill,
                stroke: this.defaultStroke,
                image: new Circle({
                    radius: 5,
                    fill,
                    stroke: this.defaultStroke
                }),
            });
        },

        createTextStyle(text) {
            return new Style({
                text: new Text({
                    text,
                    overflow: true,
                    fill: new Fill({color: "#fff"}),
                    stroke: new Stroke({color: "#000", width: 3})
                })
            });
        },

        changeOpacity(style, opacity) {
            let color = style.getFill().getColor();
            style.getImage().setOpacity(opacity);
            color[3] = this.layersOpacity;
        },

        initializeStyles() {
            this.defaultStroke = new Stroke({color: [0, 0, 0, this.layersOpacity], width: 2});
            this.defaultStyle = this.createColorStyle("#fff");

            let width = 2;

            let blueStroke = new Stroke({color: [0, 153, 255, 1], width: width});
            let whiteStroke = new Stroke({color: [255, 255, 255, 1], width: width + 2});

            this.editStyles = [
                new Style({ stroke: whiteStroke }),
                new Style({ stroke: blueStroke }),
                new Style({ image: new Circle({radius: 6, stroke: blueStroke}) })
            ];
        }
    },
    async created() {
        this.initializeStyles();

        this.loadTerms();
        await this.loadLayers();

        this.addLayer(this.currentUserLayer);
    }
};
</script>

<style>

.layers select {
    width: 220px;
}

.layers-table {
    margin-bottom: 10px !important;
}

.layers-table tbody {
    display:block;
    overflow:auto;
    max-height: 100px;
}

.layers-table thead tr {
   display: block;
}

.layers .table td, .layers .table th {
    padding: 3px !important;
    vertical-align: middle !important;
}

.layers td .button {
    width: 17px;
    height: 17px;
    padding: 0px;
}

th.checkbox-column, td.checkbox-column {
    width: 25px;
    text-align: center !important;
}

th.name-column, td.name-column {
    width: 200px;
}

.checkbox .control-label {
    padding: 0px !important;
}

.layers h3 {
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding-bottom: 2px;
    margin-bottom: 5px;
    margin-top: 10px;
    border-bottom: 2px solid #ddd;
}

.color-preview {
    width: 15px;
    height: 15px;
    margin-top: 2px;
    border-radius: 3px;
    box-shadow: 0px 0px 1px #777;
}

.layers input[type="range"].slider {
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
