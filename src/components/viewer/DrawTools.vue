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
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('point')" @click="activateTool('point')" :class="{'is-selected': activeTool == 'point'}">
            <span class="icon is-small"><i class="fa fa-map-marker"></i></span>
        </button>
        <!-- QUESTION: add handling of lines? need to add in backend
        <button class="button is-small" :disabled="activeLayer == null" title="Line" @click="activateTool('line')" :class="{'is-selected': activeTool == 'line'}">
            <span class="icon is-small"><i class="fa fa-minus"></i></span>
        </button> -->
        <!-- QUESTION: redefine expected behaviour
        <button class="button is-small" :disabled="activeLayer == null" title="Arrow" @click="activateTool('arrow')" :class="{'is-selected': activeTool == 'arrow'}">
            <span class="icon is-small"><i class="fa fa-long-arrow-right"></i></span>
        </button> -->
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('rectangle')" @click="activateTool('rectangle')" :class="{'is-selected': activeTool == 'rectangle'}">
            <span class="icon is-small"><i class="fa fa-stop"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('circle')" @click="activateTool('circle')" :class="{'is-selected': activeTool == 'circle'}">
            <span class="icon is-small"><i class="fa fa-circle"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('polygon')" @click="activateTool('polygon')" :class="{'is-selected': activeTool == 'polygon'}">
            <span class="icon is-small"><i class="fa fa-industry"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('freehand')" @click="activateTool('freehand')" :class="{'is-selected': activeTool == 'freehand'}" v-shortkey.once="['f']" @shortkey="activateTool('freehand')">
            <span class="icon is-small"><i class="fa fa-pencil"></i></span>
        </button>
        <!-- QUESTION: wouldn't it be better if correct add and correct remove were targeted on a previously selected annot? -->
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('freehand-correct-add')" @click="activateTool('correct-add')" :class="{'is-selected': activeTool == 'correct-add'}">
            <span class="icon is-small"><i class="suberscript fa fa-plus"></i><i class="fa fa-pencil"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" :title="$t('freehand-correct-remove')" @click="activateTool('correct-remove')" :class="{'is-selected': activeTool == 'correct-remove'}">
            <span class="icon is-small"><i class="suberscript fa fa-minus"></i><i class="fa fa-pencil"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <!-- QUESTION: is fill tool needed? -->
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
import WKT from "ol/format/WKT";
import {fromCircle as polygonFromCircle} from "ol/geom/Polygon";
import {never, shiftKeyOnly} from "ol/events/condition";

import {Annotation} from "cytomine-client";

import {isCluster} from "@/utils/utils.js";

export default {
    name: "draw-tools",
    props: ["image"],
    data() {
        return {
            confirmModalActive: false
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.images[this.image.id];
        },
        activeTool: {
            get() {
                return this.imageWrapper.activeTool;
            },
            set(tool) {
                this.$store.commit("activateTool", {idImage: this.image.id, tool});
            }

        },
        activeEditTool: {
            get() {
                return this.imageWrapper.activeEditTool;
            },
            set(tool) {
                this.$store.commit("activateEditTool", {idImage: this.image.id, tool});
            }
        },
        selectedFeatures() {
            return this.imageWrapper.selectedFeatures;
        },
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
            return this.imageWrapper.map.getLayers().getArray();
        },
        activeLayer() {
            // QUESTION: treat multiple active layers ? I don't think it's a good idea, discuss with team
            return this.layers.find(layer => layer.get("drawOn"));
        },
        activeSource() {
            if(this.activeLayer) {
                return this.activeLayer.getSource();
            }
        },
        actions() {
            return this.imageWrapper.actions;
        },
        undoneActions() {
            return this.imageWrapper.undoneActions;
        }
    },
    watch: {
        selectedFeature(newFeature, oldFeature) {
            if(oldFeature != null) {
                oldFeature.changed(); // force rerendering of the previously selected feature
            }
        },

        activeEditTool(newTool, oldTool) {
            if((oldTool == "modify" || newTool == "modify") && this.selectedFeature != null) {
                // trigger a refresh of the feature, because the style is different in edit mode (vertices displayed)
                this.selectedFeature.changed();
            }
        },

        activeLayer(layer) {
            if(layer == null) {
                this.activateTool("select");
            }
        }
    },
    methods: {
        activateTool(tool, forceRefresh=false) {
            if(this.activeTool == tool && !forceRefresh) {
                return;
            }

            if(this.activeTool == "select" && tool != "select") {
                this.$store.commit("clearSelectedFeatures", this.image.id);
                this.activateEditTool(null);
            }

            this.activeTool = tool;
            let interaction = (tool == "select") ? this.getSelector() : this.getDrawer();
            this.$store.commit("setInteraction", {idImage: this.image.id, interaction});
        },

        getSelector() {
            let selector = new Select({ // TODO: make it possible to select a feature not in first plan
                condition: click,
                toggleCondition: never, // QUESTION: handle selection of multiple elements?
                removeCondition: shiftKeyOnly,
                features: this.selectedFeatures,
                style: this.$store.getters.genStyleFunction(this.image.id),
                filter: feature => !isCluster(feature) // prevent the clusters from being selected
            });

            return selector;
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
                this.$store.commit("clearSelectedFeatures", this.image.id);
                this.selectedFeatures.push(feature);
                this.storeAction(feature, null);
                // TODO this.$store.commit("incrementAnnotCount", {idImage: this.image.id, idLayer: annot.user});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-creation")});
                // drawn feature will not be displayed because annot property not set
            }
        },

        getWktLocation(feature) {
            let format = new WKT();
            // transform circle to circular polygon
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

                    this.$store.commit("clearSelectedFeatures", this.image.id);
                    this.selectedFeatures.push(correctedFeature);
                }
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-correction")});
            }
        },

        activateEditTool(tool) {
            this.activeEditTool = (this.activeEditTool == tool) ? null : tool; // toggle behaviour
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
            }

            this.$store.commit("setEditInteraction", {idImage: this.image.id, interaction});
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
                this.$store.commit("clearSelectedFeatures", this.image.id);
                // TODO this.$store.commit("decrementAnnotCount", {idImage: this.image.id, idLayer: annot.user});
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
            let action = {feature, oldAnnot};
            this.$store.commit("addAction", {idImage: this.image.id, action});
        },

        // BUG correction actions not treated correctly (backend does not return all corrected annots => cannot cancel all changes)
        async undo() {
            let action = this.actions[this.actions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action);
                this.$store.commit("undoAction", {idImage: this.image.id, opposedAction});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-undo")});
            }
        },

        async redo() {
            let action = this.undoneActions[this.undoneActions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action);
                this.$store.commit("redoAction", {idImage: this.image.id, opposedAction});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-redo")});
            }
        },

        async reverseAction({feature, oldAnnot}) {
            let annot = feature.get("annot");
            let source = this.findSource(annot);
            let currentFeature = source ? source.getFeatureById(annot.id) : null; // the features may have been redrawn => not necessarily the same as feature stored in action

            let oldAnnotReversedAction = annot.clone();

            if(oldAnnot == null) { // annotation was created
                await Annotation.delete(annot.id);
                if(currentFeature != null) {
                    source.removeFeature(currentFeature);
                    if(this.selectedFeatures.getArray().includes(currentFeature)) {
                        this.$store.commit("clearSelectedFeatures", this.image.id);
                    }
                }
                feature.set("deleted", true); // so that reverse action is correctly handled
            }
            else if(feature.get("deleted")) { // annotation was deleted
                annot.id = null; // set ID to null in order to force creation of a new annotation
                await annot.save();
                // TODO: reset term, properties, description, etc (or rely on backend undo/todo)
                feature.setId(annot.id);
                feature.set("deleted", false);
                if(source != null) {
                    source.addFeature(feature);
                }
                oldAnnotReversedAction = null; // so that the reverse action results in a deletion
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
        // force creation of a new interaction so that handlers are reinitialized (otherwise, reference to destroyed
        // object attributes in callbacks)
        this.activateTool(this.activeTool, true);
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
