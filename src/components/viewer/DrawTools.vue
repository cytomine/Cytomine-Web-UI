<template>
<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<div>
    <div class="buttons has-addons">
        <!--<b-tooltip label="Select" type="is-light" position="is-bottom">-->
            <button class="button is-small" :title="$t('select')" @click="activateTool('select')" :class="{'is-selected': activeTool == 'select'}" v-shortkey.once="['s']" @shortkey="activateTool('select')">
                <span class="icon is-small"><i class="fa fa-mouse-pointer"></i></span>
            </button>
        <!--</b-tooltip>-->
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :title="$t('point')" @click="activateTool('point')" :class="{'is-selected': activeTool == 'point'}">
            <span class="icon is-small"><i class="fa fa-map-marker"></i></span>
        </button>
        <!-- TODO: not handled in backend
        <button class="button is-small" title="Line" @click="activateTool('line')" :class="{'is-selected': activeTool == 'line'}">
            <span class="icon is-small"><i class="fa fa-minus"></i></span>
        </button> -->
        <!-- TODO: redefine expected behaviour
        <button class="button is-small" title="Arrow" @click="activateTool('arrow')" :class="{'is-selected': activeTool == 'arrow'}">
            <span class="icon is-small"><i class="fa fa-long-arrow-right"></i></span>
        </button> -->
        <button class="button is-small" :title="$t('rectangle')" @click="activateTool('rectangle')" :class="{'is-selected': activeTool == 'rectangle'}">
            <span class="icon is-small"><i class="fa fa-stop"></i></span>
        </button>
        <button class="button is-small" :title="$t('circle')" @click="activateTool('circle')" :class="{'is-selected': activeTool == 'circle'}">
            <span class="icon is-small"><i class="fa fa-circle"></i></span>
        </button>
        <button class="button is-small" :title="$t('polygon')" @click="activateTool('polygon')" :class="{'is-selected': activeTool == 'polygon'}">
            <span class="icon is-small"><i class="fa fa-industry"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :title="$t('freehand')" @click="activateTool('freehand')" :class="{'is-selected': activeTool == 'freehand'}" v-shortkey.once="['f']" @shortkey="activateTool('freehand')">
            <span class="icon is-small"><i class="fa fa-pencil"></i></span>
        </button>
        <button class="button is-small" :title="$t('freehand-correct-add')" @click="activateTool('correct-add')" :class="{'is-selected': activeTool == 'correct-add'}">
            <span class="icon is-small"><i class="suberscript fa fa-plus"></i><i class="fa fa-pencil"></i></span>
        </button>
        <button class="button is-small" :title="$t('freehand-correct-remove')" @click="activateTool('correct-remove')" :class="{'is-selected': activeTool == 'correct-remove'}">
            <span class="icon is-small"><i class="suberscript fa fa-minus"></i><i class="fa fa-pencil"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <!-- TODO: fill -->
        <button class="button is-small" :disabled="!isNotPointSelected" :title="$t('modify')" @click="activateEditTool('modify')" :class="{'is-selected': activeEditTool == 'modify'}">
            <span class="icon is-small"><i class="fa fa-pencil-square-o"></i></span>
        </button>
        <button class="button is-small" :disabled="selectedFeature == null" :title="$t('move')" @click="activateEditTool('translate')" :class="{'is-selected': activeEditTool == 'translate'}">
            <span class="icon is-small"><i class="fa fa-arrows"></i></span>
        </button>
        <button class="button is-small" :disabled="!isNotPointSelected" :title="$t('rotate')" @click="activateEditTool('rotate')" :class="{'is-selected': activeEditTool == 'rotate'}">
            <span class="icon is-small"><i class="fa fa-refresh"></i></span>
        </button>
        <button class="button is-small" :disabled="selectedFeature == null" :title="$t('delete')" @click="confirmModalActive = true" v-shortkey.once="['d']" @shortkey="confirmModalActive = true">
            <span class="icon is-small"><i class="fa fa-trash-o"></i></span>
        </button>
    </div>

    <div class="buttons has-addons">
        <button class="button is-small" :disabled="actions.length == 0" :title="$t('undo')" @click="undo()" v-shortkey.once="['ctrl', 'z']" @shortkey="undo()">
            <span class="icon is-small"><i class="fa fa-undo"></i></span>
        </button>
        <button class="button is-small" :disabled="undoneActions.length == 0" :title="$t('redo')" @click="redo()" v-shortkey.once="['ctrl', 'y']" @shortkey="redo()">
            <span class="icon is-small"><i class="fa fa-repeat"></i></span>
        </button>
    </div>

    <b-modal :active.sync="confirmModalActive" :has-modal-card="true"> <!-- TODO: rework design ; + use vuejs-dialog? -->
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ $t("confirm-deletion") }}</p>
            </header>
            <section class="modal-card-body">
                {{ $t("confirm-deletion-annotation") }}
            </section>
            <footer class="modal-card-foot">
                <button class="button is-success" @click="deleteAnnot()">{{ $t("button-confirm") }}</button>
                <button class="button" @click="confirmModalActive = false">{{ $t("button-cancel") }}</button>
            </footer>
        </div>
    </b-modal>
</div>
</template>

<script>
import {click} from "ol/events/condition";
import {Select, Draw, Modify, Translate} from "ol/interaction";
import Rotate from "ol-rotate-feature";
import {createBox} from "ol/interaction/Draw";
import Collection from "ol/Collection";
import WKT from "ol/format/WKT";
import {MultiPoint} from "ol/geom";
import {fromCircle as polygonFromCircle} from "ol/geom/Polygon";
import {Style, Fill, Stroke, Circle} from "ol/style";

import {Annotation} from "cytomine-client";

export default {
    name: "draw-tools",
    props: [
        "map",
        "image"
    ],
    data() {
        return {
            activeTool: null,
            activeEditTool: null,
            selectedFeatures: new Collection(),
            currentInteraction: null,
            currentEditInteraction: null,
            actions: [],
            undoneActions: [],
            confirmModalActive: false
        };
    },
    computed: {
        selectedFeature() {
            if(this.selectedFeatures.getLength() == 1) {
                return this.selectedFeatures.item(0);
            }
        },
        isNotPointSelected() { // true iff there is a feature selected that is not a point
            if(this.selectedFeature != null) {
                return this.selectedFeature.getGeometry().getType() != "Point";
            }
            return false;
        },
        layers() {
            return this.map.getLayers().getArray();
        },
        activeLayer() {
            // TODO: treat multiple active layers ? I don't think it's a good idea, discuss with team
            return this.layers.find(layer => layer.get("drawOn"));
        },
        activeSource() {
            if(this.activeLayer) {
                return this.activeLayer.getSource();
            }
        }
    },
    watch: {
        // selectedFeature(newFeature, oldFeature) { // TODO: clean
        //     if(oldFeature != null) {
        //         oldFeature.changed(); // force rerendering of the previously selected feature
        //     }
        // },
    },
    methods: {
        activateTool(tool) {
            if(this.activeTool == tool) {
                return;
            }

            if(this.activeTool == "select") {
                this.selectedFeatures.clear();
                this.activateEditTool(null);
            }

            this.activeTool = tool;
            if(this.currentInteraction) {
                this.map.removeInteraction(this.currentInteraction);
            }

            let interaction = (tool == "select") ? this.getSelector() : this.getDrawer();
            this.map.addInteraction(interaction);
            this.currentInteraction = interaction;
        },

        getSelector() {
            let selector = new Select({ // TODO: make it possible to select a feature not in first plan
                condition: click,
                features: this.selectedFeatures,
                style: this.styleFunction, // TODO: should use the style function defined in AnnotationsPanel!
                filter: this.filterFunction
            });

            return selector;
        },

        styleFunction() {
            // inspired by default editing style (https://github.com/openlayers/openlayers/blob/v5.2.0/src/ol/style/Style.js)
            let width = 2;

            let blue = [0, 153, 255, 1];
            let white = [255, 255, 255, 1];
            let blueStroke = new Stroke({color: blue, width: width});
            let whiteStroke = new Stroke({color: white, width: width + 2});

            let styles = [
                new Style({ fill: new Fill({color: [255, 255, 255, 0.5]}), stroke: whiteStroke }),
                new Style({ stroke: blueStroke }),
                new Style({ image: new Circle({radius: 6, fill: new Fill({color: white}), stroke: blueStroke}) }),
            ];

            // if edit mode, display vertices
            if(this.activeEditTool == "modify") {
                styles.push(new Style({
                    image: new Circle({radius: width + 1, fill: new Fill({color: blue})}),
                    geometry: function(feature) {
                        // return the coordinates of the first ring of the polygon
                        var coordinates = feature.getGeometry().getCoordinates()[0];
                        return new MultiPoint(coordinates);
                    }
                }));
            }

            return styles;
        },

        filterFunction(feature) { // the clusters are not selectable => filter them
            let annot = feature.get("annot");
            return annot != null && annot.count == null;
        },

        getDrawer() {
            if(this.activeSource == null) {
                return;
            }

            let tool = this.activeTool;
            let correction = (tool == "correct-add" || tool == "correct-remove");
            let freehand = (tool == "freehand" || correction);
            let geometryFunction = (tool == "rectangle") ? createBox() : null;

            let drawer = new Draw({
                type: this.getDrawType(),
                source: this.activeSource,
                freehand,
                geometryFunction
            });

            let endHandler = (correction) ? this.endCorrection : this.endDraw;
            drawer.on("drawend", endHandler);

            return drawer;
        },

        getDrawType() {
            switch(this.activeTool) {
                case "point":
                    return "Point";
                case "line":
                    return "LineString";
                case "rectangle": case "circle":
                    return "Circle";
                case "polygon": case "freehand": case "correct-add": case "correct-remove":
                    return "Polygon";
                default:
                    this.$notify({type: "error", text: this.activeTool + " not implemented"}); // TODO: remove
            }
        },

        async endDraw({feature}) {
            if(this.activeLayer == null) {
                return;
            }
            let user = this.activeLayer.get("id");
            let annot = new Annotation({location: this.getWktLocation(feature), image: this.image.id, user});
            try {
                await annot.save();
                feature.set("annot", annot);
                feature.setId(annot.id);
                this.selectedFeatures.clear();
                this.selectedFeatures.push(feature);
                this.storeAction(feature, null);
                // TODO: update annotation count (could use addfeature event (triggered when refresh of source as well))
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-create")});
                // drawn feature will not be displayed because annot property not set
            }
        },

        async createAnnotation() {

        },

        getWktLocation(feature) {
            let format = new WKT();
            // Transform circle to circular polygon
            let geometry = feature.getGeometry();
            if (geometry.getType() == "Circle") {
                feature.setGeometry(polygonFromCircle(geometry));
            }
            return format.writeFeature(feature);
        },

        async endCorrection({feature}) {
            if(this.activeLayer == null) {
                return;
            }
            let remove = (this.activeTool == "correct-remove");
            let review = false; // TODO: handle
            let geom = this.getWktLocation(feature);
            let idLayer = this.activeLayer.get("id");
            try {
                let correctedAnnot = await Annotation.correctAnnotations(this.image.id, geom, review, remove, [idLayer]);
                if(correctedAnnot != null) {
                    let correctedFeature = this.activeSource.getFeatureById(correctedAnnot.id);
                    if(correctedFeature == null) {
                        return;
                    }
                    this.storeAction(correctedFeature, correctedFeature.get("annot"));
                    correctedFeature.set("annot", correctedAnnot);
                    correctedFeature.setId(correctedAnnot.id);
                    correctedFeature.setGeometry(new WKT().readGeometry(correctedAnnot.location));

                    this.selectedFeatures.clear();
                    this.selectedFeatures.push(correctedFeature);
                }
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-correction")});
            }
        },

        activateEditTool(tool) {
            if(this.currentEditInteraction) {
                this.map.removeInteraction(this.currentEditInteraction);
            }

            if(this.activeEditTool == tool) {
                this.activeEditTool = null;
            }

            if((this.activeEditTool == "modify" || tool == "modify") && this.selectedFeature != null) {
                // trigger a refresh of the feature, because the style is different in edit mode (vertices displayed)
                this.selectedFeature.changed();
            }

            this.activeEditTool = tool;
            if(this.activeEditTool == null) {
                return;
            }

            let interaction = null;

            switch(tool) {
                case "modify":
                    interaction = new Modify({features: this.selectedFeatures});
                    interaction.on("modifyend", this.endEdit);
                    break;

                case "rotate":
                    interaction = new Rotate({features: this.selectedFeatures});
                    interaction.on("rotateend", this.endEdit);
                    break;

                case "translate":
                    interaction = new Translate({features: this.selectedFeatures});
                    interaction.on("translateend", this.endEdit);
                    break;

                default:
                    return;
            }

            this.map.addInteraction(interaction);
            this.currentEditInteraction = interaction;
        },

        async endEdit({features}) {
            features.forEach(async feature => {
                let annot = feature.get("annot");
                if(annot == null) {
                    return;
                }

                let previousAnnot = annot.clone();
                try {
                    annot.location = this.getWktLocation(feature);
                    await annot.save();
                    this.storeAction(feature, previousAnnot);
                }
                catch(err) {
                    this.$notify({type: "error", text: this.$t("notif-error-annotation-update")});
                    annot.location = previousAnnot.location;
                    feature.setGeometry(new WKT().readGeometry(annot.location));
                }
            });
        },

        async deleteAnnot() {
            let feature = this.selectedFeature;
            if(feature == null) {
                return;
            }

            this.activateEditTool(null);

            try {
                let annot = feature.get("annot");
                await Annotation.delete(annot.id);
                feature.set("deleted", true);

                let source = this.findSource(annot);
                if(source != null) {
                    source.removeFeature(feature);
                }

                this.storeAction(feature, annot);
                this.selectedFeatures.clear();
                // TODO: update annotation count
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-deletion")});
            }
            finally {
                this.confirmModalActive = false;
            }
        },

        findSource(annot) {
            let layer = this.layers.find(layer => layer.get("id") == annot.user);
            if(layer == null) {
                return null;
            }
            return layer.getSource();
        },

        storeAction(feature, oldAnnot) {
            this.actions.push({feature, oldAnnot});
            this.undoneActions = [];
        },

        // BUG correction actions not treated correctly (backend does not return all corrected annots => cannot cancel all changes)
        async undo() {
            let action = this.actions.pop();
            try {
                let opposedAction = await this.reverseAction(action);
                this.undoneActions.push(opposedAction);
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-undo")});
            }
        },

        async redo() {
            let action = this.undoneActions.pop();
            try {
                let opposedAction = await this.reverseAction(action);
                this.actions.push(opposedAction);
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-redo")});
            }
        },

        async reverseAction({feature, oldAnnot}) { // TODO: handle selected element ?
            let annot = feature.get("annot");
            let source = this.findSource(annot);
            let currentFeature = source ? source.getFeatureById(annot.id) : null; // the features may have been redrawn => not necessarily the same as feature stored in action

            let oldAnnotReversedAction = annot.clone();

            if(oldAnnot == null) { // annotation was created
                await Annotation.delete(annot.id);
                if(currentFeature != null) {
                    source.removeFeature(currentFeature);
                }
                feature.set("deleted", true); // so that reverse action is correctly handled
            }
            else if(feature.get("deleted")) { // annotation was deleted
                annot.id = null; // set ID to null in order to force creation of a new annotation
                await annot.save();
                feature.setId(annot.id);
                feature.set("deleted", false);
                source.addFeature(feature);
                oldAnnotReversedAction = null; // the reverse action should be a deletion
            }
            else { // annotation was updated
                annot.location = oldAnnot.location;
                await annot.save();
                if(currentFeature != null) {
                    currentFeature.setGeometry(new WKT().readGeometry(annot.location));
                }
            }

            feature.set("annot", annot);
            return {feature, oldAnnot: oldAnnotReversedAction};
        }
    },
    created() {
        this.activateTool("select");
    }
};
</script>

<style scoped>
.buttons {
    float:left;
    margin-left: 1px;
    margin-right: 1px;
    margin-bottom: 0px !important;
}

.button {
    margin-bottom:0px !important;
}

.suberscript {
    position: relative;
    bottom: 5px;
    left: 1px;
    font-size: 8px;
}

.button.is-selected {
    background-color: #6899d0;
    color: #fff;
}

:focus {outline:none;}
::-moz-focus-inner {border:0;}
</style>
