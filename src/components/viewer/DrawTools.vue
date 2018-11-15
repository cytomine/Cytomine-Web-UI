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
        <button class="button is-small" :disabled="selectedFeature == null" :title="$t('delete')" @click="confirmDeletion()" v-shortkey.once="['d']" @shortkey="confirmDeletion()">
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
</div>
</template>

<script>
import WKT from "ol/format/WKT";

import {Annotation} from "cytomine-client";

export default {
    name: "draw-tools",
    props: ["image"],
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
            // QUESTION: treat multiple active layers ? I don't think it's a good idea, discuss with team
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
                this.$store.commit("clearSelectedFeatures", this.image.id);
                this.activeEditTool = null;
            }

            this.activeTool = tool;
        },

        activateEditTool(tool) {
            this.activeTool = "select";
            this.activeEditTool = (this.activeEditTool == tool) ? null : tool; // toggle behaviour
        },

        findSource(annot) {
            let layer = this.layers.find(layer => layer.id == annot.user);
            if(layer == null) {
                return null;
            }
            return layer.olSource;
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

                this.$store.commit("addAction", {idImage: this.image.id, feature: olFeature, oldAnnot: annot});
                this.$store.commit("clearSelectedFeatures", this.image.id);
                // TODO this.$store.commit("decrementAnnotCount", {idImage: this.image.id, idLayer: annot.user});

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
                    if(this.selectedFeatures.map(ftr => ftr.id).includes(currentFeature.getId())) {
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
