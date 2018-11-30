<template>
<!-- TODO: handle project config - implement in js client but wait for normalization of endpoint (currently: {host}/custom-ui/config.json?project={id}}) -->
<div>
    <div class="buttons has-addons">
        <button v-tooltip="$t('select')" class="button is-small" @click="activateTool('select')" :class="{'is-selected': activeTool == 'select'}" v-shortkey.once="['s']" @shortkey="activateTool('select')">
            <span class="icon is-small"><i class="fas fa-mouse-pointer"></i></span>
        </button>
    </div>
    <div class="buttons has-addons term-selection" @mouseleave="showTermSelector = false">
            <button v-tooltip="$t('terms-new-annotation')" class="button is-small" @click="showTermSelector = !showTermSelector">
                <span class="icon is-small"><i class="fas fa-hashtag"></i></span>
            </button>
            <div class="color-preview" :style="{background: backgroundTermsNewAnnot}"></div>
            <div class="dropdown-menu" v-show="showTermSelector">
                <div class="dropdown-content">
                    <a class="dropdown-item" v-for="(term, idx) in terms" :key="term.id" @click="toggleTerm(idx)" :class="{'is-selected': term.associateToNewAnnot}">
                        <div class="autocomplete-term-option">
                            <span class="selection"><i class="fas fa-check"></i></span>
                            <span>
                                <cytomine-term :term="term"></cytomine-term>
                            </span>
                        </div>
                    </a>
                </div>
            </div>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('point')" @click="activateTool('point')" :class="{'is-selected': activeTool == 'point'}" v-shortkey.once="['p']" @shortkey="activateTool('point')">
            <span class="icon is-small"><i class="fas fa-map-marker-alt"></i></span>
        </button>
        <!-- QUESTION: add handling of lines? need to add in backend
        <button class="button is-small" :disabled="activeLayer == null" title="Line" @click="activateTool('line')" :class="{'is-selected': activeTool == 'line'}">
            <span class="icon is-small"><i class="fas fa-minus"></i></span>
        </button> -->
        <!-- QUESTION: redefine expected behaviour
        <button class="button is-small" :disabled="activeLayer == null" title="Arrow" @click="activateTool('arrow')" :class="{'is-selected': activeTool == 'arrow'}">
            <span class="icon is-small"><i class="fas fa-long-arrow-right"></i></span>
        </button> -->
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('rectangle')" @click="activateTool('rectangle')" :class="{'is-selected': activeTool == 'rectangle'}">
            <span class="icon is-small"><i class="far fa-square"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('circle')" @click="activateTool('circle')" :class="{'is-selected': activeTool == 'circle'}">
            <span class="icon is-small"><i class="far fa-circle"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('polygon')" @click="activateTool('polygon')" :class="{'is-selected': activeTool == 'polygon'}">
            <span class="icon is-small"><i class="fas fa-draw-polygon"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('freehand')" @click="activateTool('freehand')" :class="{'is-selected': activeTool == 'freehand'}" v-shortkey.once="['f']" @shortkey="activateTool('freehand')">
            <span class="icon is-small"><i class="fas fa-pencil-alt"></i></span>
        </button>
        <!-- TODO: would be better if correct add and correct remove were targeted on a previously selected annot
        backend modif required (https://github.com/cytomine/Cytomine-core/issues/1141) -->
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('freehand-correct-add')" @click="activateTool('correct-add')" :class="{'is-selected': activeTool == 'correct-add'}">
            <span class="icon is-small"><i class="suberscript fas fa-plus"></i><i class="fas fa-pencil-alt"></i></span>
        </button>
        <button class="button is-small" :disabled="activeLayer == null" v-tooltip="$t('freehand-correct-remove')" @click="activateTool('correct-remove')" :class="{'is-selected': activeTool == 'correct-remove'}">
            <span class="icon is-small"><i class="suberscript fas fa-minus"></i><i class="fas fa-pencil-alt"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :disabled="selectedFeature == null" v-tooltip="$t('display-annot-details')" @click="displayAnnotDetails = !displayAnnotDetails" :class="{'is-selected': displayAnnotDetails && selectedFeature != null}">
            <span class="icon is-small"><i class="fas fa-info"></i></span>
        </button>
    </div>
    <div class="buttons has-addons">
        <button class="button is-small" :disabled="!isNotPointSelected" v-tooltip="$t('fill')" @click="fill()">
            <span class="icon is-small"><i class="fas fa-fill"></i></span>
        </button>
        <button class="button is-small" :disabled="!isNotPointSelected" v-tooltip="$t('modify')" @click="activateEditTool('modify')" :class="{'is-selected': activeEditTool == 'modify'}">
            <span class="icon is-small"><i class="fas fa-edit"></i></span>
        </button>
        <button class="button is-small" :disabled="selectedFeature == null" v-tooltip="$t('move')" @click="activateEditTool('translate')" :class="{'is-selected': activeEditTool == 'translate'}">
            <span class="icon is-small"><i class="fas fa-arrows-alt"></i></span>
        </button>
        <button class="button is-small" :disabled="!isNotPointSelected" v-tooltip="$t('rotate')" @click="activateEditTool('rotate')" :class="{'is-selected': activeEditTool == 'rotate'}">
            <span class="icon is-small"><i class="fas fa-sync-alt"></i></span>
        </button>
        <button class="button is-small" :disabled="selectedFeature == null" v-tooltip="$t('delete')" @click="confirmDeletion()" v-shortkey.once="['d']" @shortkey="confirmDeletion()">
            <span class="icon is-small"><i class="far fa-trash-alt"></i></span>
        </button>
    </div>

    <div class="buttons has-addons">
        <button class="button is-small" :disabled="actions.length == 0" v-tooltip="$t('undo')" @click="undo()" v-shortkey.once="['ctrl', 'z']" @shortkey="undo()">
            <span class="icon is-small"><i class="fas fa-undo"></i></span>
        </button>
        <button class="button is-small" :disabled="undoneActions.length == 0" v-tooltip="$t('redo')" @click="redo()" v-shortkey.once="['ctrl', 'y']" @shortkey="redo()">
            <span class="icon is-small"><i class="fas fa-redo"></i></span>
        </button>
    </div>
</div>
</template>

<script>
import CytomineTerm from "@/components/utils/CytomineTerm";

import WKT from "ol/format/WKT";

import {Annotation} from "cytomine-client";

export default {
    name: "draw-tools",
    components: {CytomineTerm},
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            showTermSelector: false,
            format: new WKT()
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        terms() {
            return this.imageWrapper.terms;
        },
        termsToAssociate() {
            return this.terms.filter(term => term.associateToNewAnnot);
        },
        backgroundTermsNewAnnot() {
            if(this.termsToAssociate.length == 0) {
                return "white";
            }
            else if(this.termsToAssociate.length == 1) {
                return this.termsToAssociate[0].color;
            }
            else {
                let colors = this.termsToAssociate.map(term => term.color);
                return `-webkit-linear-gradient(${colors.join()})`;
            }
        },
        activeTool: {
            get() {
                return this.imageWrapper.activeTool;
            },
            set(tool) {
                this.$store.commit("activateTool", {idViewer: this.idViewer, index: this.index, tool});
            }
        },
        displayAnnotDetails: {
            get() {
                return this.imageWrapper.displayAnnotDetails;
            },
            set(value) {
                this.$store.commit("setDisplayAnnotDetails", {idViewer: this.idViewer, index: this.index, value});
            }
        },
        activeEditTool: {
            get() {
                return this.imageWrapper.activeEditTool;
            },
            set(tool) {
                this.$store.commit("activateEditTool", {idViewer: this.idViewer, index: this.index, tool});
            }
        },
        selectedFeatures() {
            return this.imageWrapper.selectedFeatures;
        },
        selectedFeature() {
            if(this.selectedFeatures.length == 1) {
                return this.selectedFeatures[0];
            }
        },
        isNotPointSelected() { // true iff there is a feature selected that is not a point
            if(this.selectedFeature != null) {
                return this.selectedFeature.geometry.type != "Point";
            }
            return false;
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        activeLayer() {
            return this.layers.find(layer => layer.drawOn);
        },
        actions() {
            return this.imageWrapper.actions;
        },
        undoneActions() {
            return this.imageWrapper.undoneActions;
        }
    },
    watch: {
        activeLayer(layer) {
            if(layer == null) {
                this.activeTool = "select";
            }
        }
    },
    methods: {
        activateTool(tool) {
            if(this.activeTool == "select" && tool != "select") {
                this.$store.commit("clearSelectedFeatures", {idViewer: this.idViewer, index: this.index});
                this.activeEditTool = null;
            }

            this.activeTool = tool;
        },

        activateEditTool(tool) {
            this.activeTool = "select";
            this.activeEditTool = (this.activeEditTool == tool) ? null : tool; // toggle behaviour
        },

        toggleTerm(indexTerm) {
            this.$store.commit("toggleAssociateTermToNewAnnot", {
                idViewer: this.idViewer,
                index: this.index,
                indexTerm: indexTerm
            });
        },

        findSource(annot) {
            let layer = this.layers.find(layer => layer.id == annot.user);
            if(layer == null) {
                return null;
            }
            return layer.olSource;
        },

        async fill() {
            let feature = this.selectedFeature;
            if(feature == null) {
                return;
            }

            this.activateEditTool(null);
            let annot = feature.properties.annot;
            let oldAnnot = annot.clone();

            try {
                await annot.fill();
                let olFeature = this.findSource(annot).getFeatureById(annot.id);
                olFeature.setGeometry(this.format.readGeometry(annot.location));
                this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, feature: olFeature, oldAnnot});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-fill")});
            }
        },

        async deleteAnnot() {
            let feature = this.selectedFeature;
            if(feature == null) {
                return;
            }

            this.activateEditTool(null);

            try {
                let annot = feature.properties.annot;
                await Annotation.delete(annot.id);

                let source = this.findSource(annot);
                let olFeature = source.getFeatureById(annot.id);
                olFeature.set("deleted", true);

                this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, feature: olFeature, oldAnnot: annot});
                this.$store.commit("clearSelectedFeatures", {idViewer: this.idViewer, index: this.index});
                this.$store.commit("triggerIndexLayersUpdate", {idViewer: this.idViewer, index: this.index});

                source.removeFeature(feature);
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-deletion")});
            }
        },

        confirmDeletion() {
            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-annotation"),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteAnnot()
            });
        },

        // BUG correction actions not treated correctly (backend does not return all corrected annots => cannot cancel all changes)
        async undo() {
            let action = this.actions[this.actions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action);
                this.$store.commit("undoAction", {idViewer: this.idViewer, index: this.index, opposedAction});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-undo")});
            }
        },

        async redo() {
            let action = this.undoneActions[this.undoneActions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action);
                this.$store.commit("redoAction", {idViewer: this.idViewer, index: this.index, opposedAction});
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
                    if(this.selectedFeatures.map(ftr => ftr.id).includes(currentFeature.getId())) {
                        this.$store.commit("clearSelectedFeatures", {idViewer: this.idViewer, index: this.index});
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

            this.$store.commit("triggerIndexLayersUpdate", {idViewer: this.idViewer, index: this.index});

            feature.set("annot", annot);
            return {feature, oldAnnot: oldAnnotReversedAction};
        }
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

.term-selection {
    position: relative;
}

.term-selection .dropdown-menu {
    display: block;
    z-index: 500;
    left: -20px;
}

.term-selection .dropdown-menu a.is-selected {
    background: #f5f5f5;
}

.term-selection .dropdown-menu a:not(.is-selected) i.fas {
    display: none;
}

.term-selection .selection {
    width: 15px;
    display: inline-block;
    position: relative;
    right: 6px;
}

.color-preview {
    width: 8px;
    height: 8px;
    display: inline-block;
    border-radius: 2px;
    box-shadow: 0px 0px 1px #777;
    position: absolute;
    bottom: 3px;
    right: 2px;
    z-index: 1000;
    pointer-events: none;
}

</style>
