<template>
<div class="draw-tools-wrapper">
    <div class="buttons has-addons" v-if="isToolDisplayed('select')">
        <button v-tooltip="$t('select')"
                class="button is-small" :class="{'is-selected': activeTool === 'select'}"
                @click="activateTool('select')" v-shortkey.once="['s']" @shortkey="activateTool('select')">
            <span class="icon is-small"><i class="fas fa-mouse-pointer"></i></span>
        </button>
    </div>

    <div
        v-if="terms && terms.length > 0"
        class="buttons has-addons term-selection"
        :class="{'has-preview': termsToAssociate.length > 0}"
        v-click-outside="() => showTermSelector = false"
    >
        <button v-tooltip="$t('terms-new-annotation')" 
                class="button is-small" :disabled="disabledDraw" 
                @click="showTermSelector = !showTermSelector">
            <span class="icon is-small"><i class="fas fa-hashtag"></i></span>
        </button>

        <div class="color-preview" :style="{background: backgroundTermsNewAnnot}">
            <span v-if="termsToAssociate.length > 1">{{termsToAssociate.length}}</span>
        </div>

        <div class="ontology-tree-container" v-show="showTermSelector">
            <b-input v-model="searchStringTerm" :placeholder="$t('search-placeholder')" size="is-small" />
            <ontology-tree
                class="ontology-tree"
                v-model="termsToAssociate"
                :ontology="ontology"
                :searchString="searchStringTerm"
            />
        </div>
    </div>

    <div class="buttons has-addons">
        <button v-if="isToolDisplayed('point')" :disabled="disabledDraw" v-tooltip="$t('point')"
                class="button is-small" :class="{'is-selected': activeTool === 'point'}"
                @click="activateTool('point')" v-shortkey.once="['o']" @shortkey="activateTool('point')">
            <span class="icon is-small"><i class="fas fa-map-marker-alt"></i></span>
        </button>

        <button v-if="isToolDisplayed('line')" :disabled="disabledDraw" v-tooltip="$t('line')"
                class="button is-small" :class="{'is-selected': activeTool === 'line'}"
                @click="activateTool('line')">
            <span class="icon is-small"><i class="fas fa-minus"></i></span>
        </button>

        <button v-if="isToolDisplayed('freehand-line')" :disabled="disabledDraw" v-tooltip="$t('freehand-line')"
                class="button is-small" :class="{'is-selected': activeTool === 'freehand-line'}"
                @click="activateTool('freehand-line')">
            <span class="icon is-small">
                <icon-line-free-hand />
            </span>
        </button>

        <!-- QUESTION: redefine expected behaviour
        <button class="button is-small" :disabled="disabledDraw" title="Arrow"
                @click="activateTool('arrow')" :class="{'is-selected': activeTool === 'arrow'}">
            <span class="icon is-small"><i class="fas fa-long-arrow-right"></i></span>
        </button> -->

        <button v-if="isToolDisplayed('rectangle')" :disabled="disabledDraw" v-tooltip="$t('rectangle')"
                class="button is-small" :class="{'is-selected': activeTool === 'rectangle'}"
                @click="activateTool('rectangle')">
            <span class="icon is-small"><i class="far fa-square"></i></span>
        </button>

        <button v-if="isToolDisplayed('circle')" :disabled="disabledDraw" v-tooltip="$t('circle')"
                class="button is-small" :class="{'is-selected': activeTool === 'circle'}"
                @click="activateTool('circle')">
            <span class="icon is-small"><i class="far fa-circle"></i></span>
        </button>

        <button v-if="isToolDisplayed('polygon')" :disabled="disabledDraw" v-tooltip="$t('polygon')"
                class="button is-small" :class="{'is-selected': activeTool === 'polygon'}"
                @click="activateTool('polygon')">
            <span class="icon is-small"><i class="fas fa-draw-polygon"></i></span>
        </button>

        <button v-if="isToolDisplayed('freehand-polygon')" :disabled="disabledDraw" v-tooltip="$t('freehand-polygon')"
                class="button is-small" :class="{'is-selected': activeTool === 'freehand-polygon'}"
                @click="activateTool('freehand-polygon')" v-shortkey.once="['f']" @shortkey="activateTool('freehand-polygon')">
            <span class="icon is-small">
                <icon-polygon-free-hand />
            </span>
        </button>
    </div>

    <div v-if="configUI['project-explore-annotation-main']" class="buttons has-addons">
        <button class="button is-small" :disabled="!selectedFeature" v-tooltip="$t('display-annot-details')"
                :class="{'is-selected': displayAnnotDetails && selectedFeature}"
                @click="displayAnnotDetails = !displayAnnotDetails">
            <span class="icon is-small"><i class="fas fa-info"></i></span>
        </button>
    </div>

    <div class="buttons has-addons">
        <button v-if="isToolDisplayed('fill')" :disabled="isToolDisabled('fill')" v-tooltip="$t('fill')"
                class="button is-small"
                @click="fill()">
            <span class="icon is-small"><i class="fas fa-fill"></i></span>
        </button>

        <button v-if="isToolDisplayed('edit')" :disabled="isToolDisabled('edit')" v-tooltip="$t('modify')"
                class="button is-small" :class="{'is-selected': activeEditTool === 'modify'}"
                @click="activateEditTool('modify')">
            <span class="icon is-small"><i class="fas fa-edit"></i></span>
        </button>

        <button v-if="isToolDisplayed('union')" :disabled="isToolDisabled('correct-add')"
                v-tooltip="$t('freehand-correct-add')"
                class="button is-small" :class="{'is-selected': activeEditTool === 'correct-add'}"
                @click="activateEditTool('correct-add')">
            <span class="icon is-small"><i class="superscript fas fa-plus"></i><i class="fas fa-pencil-alt"></i></span>
        </button>

        <button v-if="isToolDisplayed('diff')" :disabled="isToolDisabled('correct-remove')"
                v-tooltip="$t('freehand-correct-remove')"
                class="button is-small" :class="{'is-selected': activeEditTool === 'correct-remove'}"
                @click="activateEditTool('correct-remove')">
            <span class="icon is-small"><i class="superscript fas fa-minus"></i><i class="fas fa-pencil-alt"></i></span>
        </button>

        <button v-if="isToolDisplayed('move')" :disabled="isToolDisabled('move')" v-tooltip="$t('move')"
                class="button is-small" :class="{'is-selected': activeEditTool === 'translate'}"
                @click="activateEditTool('translate')">
            <span class="icon is-small"><i class="fas fa-arrows-alt"></i></span>
        </button>

        <button v-if="isToolDisplayed('rotate')" :disabled="isToolDisabled('rotate')" v-tooltip="$t('rotate')"
                class="button is-small" :class="{'is-selected': activeEditTool === 'rotate'}"
                @click="activateEditTool('rotate')">
            <span class="icon is-small"><i class="fas fa-sync-alt"></i></span>
        </button>

        <button v-if="isToolDisplayed('delete')" :disabled="isToolDisabled('delete')" v-tooltip="$t('delete')"
                class="button is-small"
                @click="confirmDeletion()" v-shortkey.once="['d']" @shortkey="confirmDeletion()">
            <span class="icon is-small"><i class="far fa-trash-alt"></i></span>
        </button>
    </div>

    <div v-if="isToolDisplayed('undo-redo')" class="buttons has-addons">
        <button :disabled="actions.length === 0" v-tooltip="$t('undo')"
            class="button is-small"
            @click="undo()" v-shortkey.once="['ctrl', 'z']" @shortkey="undo()">
            <span class="icon is-small"><i class="fas fa-undo"></i></span>
        </button>

        <button :disabled="undoneActions.length === 0" v-tooltip="$t('redo')"
                class="button is-small"
                @click="redo()" v-shortkey.once="['ctrl', 'y']" @shortkey="redo()">
            <span class="icon is-small"><i class="fas fa-redo"></i></span>
        </button>
    </div>
</div>
</template>

<script>
import OntologyTree from "@/components/ontology/OntologyTree";
import IconPolygonFreeHand from "@/components/icons/IconPolygonFreeHand";
import IconLineFreeHand from "@/components/icons/IconLineFreeHand";

import WKT from "ol/format/WKT";

import {Cytomine, Annotation} from "cytomine-client";
import {Action, updateTermProperties} from "@/utils/annotation-utils.js";

export default {
    name: "draw-tools",
    components: {
        OntologyTree,
        IconPolygonFreeHand,
        IconLineFreeHand
    },
    props: {
        idViewer: String,
        index: Number
    },
    data() {
        return {
            showTermSelector: false,
            format: new WKT(),
            searchStringTerm: ""
        };
    },
    computed: {
        configUI() {
            return this.$store.state.project.configUI;
        },
        ontology() {
            return this.$store.state.project.ontology;
        },
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        terms() {
            return this.imageWrapper.terms;
        },
        termsToAssociate: {
            get() {
                return this.imageWrapper.termsNewAnnots;
            },
            set(terms) {
                this.$store.commit("setTermsNewAnnots", {idViewer: this.idViewer, index: this.index, terms});
            }
        },
        backgroundTermsNewAnnot() {
            if(this.termsToAssociate.length === 1) {
                return this.terms.find(term => this.termsToAssociate[0] === term.id).color;
            }
            else {
                return "#e2e2e2";
            }
        },
        activeTool: {
            get() {
                return this.imageWrapper.activeTool;
            },
            set(tool) {
                this.$store.dispatch("activateTool", {idViewer: this.idViewer, index: this.index, tool});
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
            if(this.selectedFeatures.length === 1) {
                return this.selectedFeatures[0];
            }
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        noActiveLayer() {
            return !this.layers.find(layer => layer.drawOn);
        },
        disabledDraw() {
            return this.noActiveLayer;
        },
        actions() {
            return this.imageWrapper.actions;
        },
        undoneActions() {
            return this.imageWrapper.undoneActions;
        }
    },
    watch: {
        noActiveLayer(value) {
            if(value) {
                this.activeTool = "select";
            }
        },
        selectedFeature(feature) {
            // disable correct tools if no feature is selected
            if(!feature && ["correct-add", "correct-remove"].includes(this.activeEditTool)) {
                this.activeEditTool = null;
            }
        }
    },
    methods: {
        isToolDisplayed(tool) {
            return this.configUI[`project-tools-${tool}`];
        },

        isToolDisabled(tool) {
            if(!this.selectedFeature) {
                return true; // no feature selected -> all edit tools disabled
            }

            if(!this.$store.getters.canEditAnnot(this.selectedFeature.properties.annot)) {
                return true;
            }

            let geomType = this.selectedFeature.geometry.type;
            if(geomType === "Point") {
                return (tool !== "move" && tool !== "delete"); // disable all tools except move and delete for points
            }
            else if(geomType === "LineString") {
                return ["fill", "correct-add", "correct-remove"].includes(tool); // disable fill and correct tools for lines
            }
            else {
                return false;
            }
        },

        activateTool(tool) {
            this.activeTool = tool;
        },

        activateEditTool(tool) {
            this.activeTool = "select";
            this.activeEditTool = (this.activeEditTool === tool) ? null : tool; // toggle behaviour
        },

        toggleTerm(indexTerm) {
            this.$store.commit("toggleAssociateTermToNewAnnot", {
                idViewer: this.idViewer,
                index: this.index,
                indexTerm: indexTerm
            });
        },

        async fill() {
            let feature = this.selectedFeature;
            if(!feature) {
                return;
            }

            this.activateEditTool(null);
            let annot = feature.properties.annot.clone();

            try {
                await annot.fill();
                this.$eventBus.$emit("editAnnotation", annot);
                this.$store.commit("addAction", {
                    idViewer: this.idViewer,
                    index: this.index,
                    annot,
                    type: Action.UPDATE
                });
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-fill")});
            }
        },

        async deleteAnnot() {
            let feature = this.selectedFeature;
            if(!feature) {
                return;
            }

            this.activateEditTool(null);

            try {
                let annot = feature.properties.annot;
                await Annotation.delete(annot.id);
                this.$eventBus.$emit("deleteAnnotation", annot);
                this.$store.commit("addAction", {
                    idViewer: this.idViewer,
                    index: this.index,
                    annot: annot,
                    type: Action.DELETE
                });
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-deletion")});
            }
        },
        confirmDeletion() {
            if(!this.selectedFeature) {
                return;
            }

            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-annotation"),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteAnnot()
            });
        },


        async undo() {
            let action = this.actions[this.actions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action, true);
                this.$store.commit("undoAction", {idViewer: this.idViewer, index: this.index, opposedAction});
            }
            catch(err) {
                console.log(err);
                this.$notify({type: "error", text: this.$t("notif-error-undo")});
            }
        },
        async redo() {
            let action = this.undoneActions[this.undoneActions.length - 1];
            try {
                let opposedAction = await this.reverseAction(action, false);
                this.$store.commit("redoAction", {idViewer: this.idViewer, index: this.index, opposedAction});
            }
            catch(err) {
                console.log(err);
                this.$notify({type: "error", text: this.$t("notif-error-redo")});
            }
        },
        async reverseAction({annot, type, command}, undo) {
            let newType = type;

            if(type === Action.CREATE) {
                await Annotation.delete(annot.id);
                this.$eventBus.$emit("deleteAnnotation", annot);
                newType = Action.DELETE;
                command = Cytomine.instance.lastCommand;
            }
            else if(type === Action.DELETE) {
                let collection = await Cytomine.instance.undo(command); // always undo if annotation was deleted
                let newAnnot = await this.getUpdatedAnnotation(collection);
                this.$eventBus.$emit("addAnnotation", newAnnot);
                newType = Action.CREATE;
            }
            else { // annotation was updated
                let collection;
                if(undo) {
                    collection = await Cytomine.instance.undo(command);
                }
                else {
                    collection = await Cytomine.instance.redo(command);
                }
                let newAnnot = await this.getUpdatedAnnotation(collection);
                this.$eventBus.$emit("editAnnotation", newAnnot);
            }

            return {annot, command, type: newType};
        },
        async getUpdatedAnnotation(collection) {
            for(let model of collection) {
                if(model.annotation) {
                    let annot = new Annotation(model.annotation);
                    await updateTermProperties(annot);
                    return annot;
                }
            }
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

.superscript {
    position: relative;
    bottom: 5px;
    left: 1px;
    font-size: 8px;
}

:focus {outline:none;}
::-moz-focus-inner {border:0;}

.term-selection {
    position: relative;
}

.term-selection.has-preview i.fas {
    font-size: 11px;
    position: relative;
    right: 3px;
    top: 2px;
}

.term-selection .ontology-tree-container {
    position: absolute;
    top: 100%;
    left: -20px;
    margin-top: 5px;
    background: white;
    min-width: 250px;
    max-width: 20vw;
    max-height: 40vh;
    overflow: auto;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    border-radius: 4px;
}

.term-selection:not(.has-preview) .color-preview {
    display:none;
}

.color-preview {
    width: 11px;
    height: 11px;
    display: inline-block;
    border-radius: 5px;
    position: absolute;
    top: 3px;
    right: 3px;
    z-index: 1000;
    pointer-events: none;
    font-size: 10px;
    font-weight: 600;
    text-align:center;
    line-height: 10px;
    font-family: Arial;
}
</style>

<style lang="scss">
$colorActiveIcon: #fff;

.draw-tools-wrapper {

    .term-selection .ontology-tree-container {

        .control {
            margin: 10px;
            margin-bottom: 0px;
        }

        .ontology-tree {
            padding: 10px 0px;
        }
    }

    .button.is-selected {
        background-color: #6899d0;
        color: $colorActiveIcon;

        path {
            stroke: $colorActiveIcon;
        }
    }

    .icon svg {
        height: 1.15em !important;
    }
}
</style>
