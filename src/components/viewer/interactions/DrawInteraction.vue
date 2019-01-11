<template>
<div>
    <vl-layer-vector>
        <vl-source-vector :ident="drawSourceName" ref="olSourceDrawTarget"></vl-source-vector>
    </vl-layer-vector>

    <vl-interaction-draw v-if="nbActiveLayers > 0"
                        ref="olDrawInteraction" 
                        :source="drawSourceName"
                        :type="drawType"
                        :freehand="drawFreehand" 
                        :freehand-condition="undefined"
                        :geometry-function="drawGeometryFunction" 
                        @drawend="drawEndHandler">
    </vl-interaction-draw>

    <calibration-modal :image="image"
                       :pixelLength="pixelLengthCalibrationFeature"
                       :active.sync="calibrationModal"
                       @setResolution="endCalibration" />
</div>
</template>

<script>
import Polygon, {fromCircle as polygonFromCircle} from "ol/geom/Polygon";
import WKT from "ol/format/WKT";

import {Annotation} from "cytomine-client";

import CalibrationModal from "@/components/image/CalibrationModal";

export default {
    name: "draw-interaction",
    components: {CalibrationModal},
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            calibrationModal: false,
            calibrationFeature: null,

            format: new WKT()
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        ongoingCalibration() {
            return this.imageWrapper.ongoingCalibration;
        },
        rotation() {
            return this.imageWrapper.rotation;
        },
        termsToAssociate() {
            return this.imageWrapper.terms.reduce((ids, term) => {
                if(term.associateToNewAnnot) {
                    ids.push(term.id);
                }
                return ids;
            }, []);
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        activeTool() {
            return this.imageWrapper.activeTool;
        },
        drawType() {
            switch(this.activeTool) {
                case "point":
                    return "Point";
                case "line":
                    return "LineString";
                case "rectangle": 
                case "circle":
                    return "Circle";
                case "polygon": 
                case "freehand": 
                case "correct-add": 
                case "correct-remove":
                    return "Polygon";
            }
        },
        drawCorrection() {
            return this.activeTool == "correct-add" || this.activeTool == "correct-remove";
        },
        drawFreehand() {
            return this.activeTool == "freehand" || this.drawCorrection;
        },
        drawGeometryFunction() {
            if(this.activeTool == "rectangle") {
                return (coordinates, geometry) => {
                    let rotatedCoords = this.rotateCoords(coordinates, this.rotation);

                    let [firstCorner, thirdCorner] = rotatedCoords;
                    let secondCorner = [thirdCorner[0], firstCorner[1]];
                    let fourthCorner = [firstCorner[0], thirdCorner[1]];

                    let rotatedBoxCoordinates = [firstCorner, secondCorner, thirdCorner, fourthCorner, firstCorner];
                    let boxCoordinates = [this.rotateCoords(rotatedBoxCoordinates, -this.rotation)];

                    if(geometry) {
                        geometry.setCoordinates(boxCoordinates);
                    }
                    else {
                        geometry = new Polygon(boxCoordinates);
                    }
                    return geometry;
                };
            }
            else {
                return null;
            }
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        activeLayers() {
            return this.layers.filter(layer => layer.drawOn);
        },
        nbActiveLayers() {
            return this.activeLayers.length;
        },
        drawSourceName() {
            return `draw-target-${this.idViewer}-${this.index}`;
        },
        pixelLengthCalibrationFeature() {
            if(this.calibrationFeature) {
                return this.calibrationFeature.getGeometry().getLength();
            }
        },
    },

    watch: {
        activeTool() {
            this.$refs.olDrawInteraction.scheduleRecreate();
        },

        calibrationModal(val) {
            if(!val) {
                this.clearDrawnFeatures();
            }
        },
        lengthCalibrationSegment(length) {
            if(length != "") {
                this.displayErrors = true;
            }
        }
    },

    methods: {
        rotateCoords(coords, theta) {
            let cosTheta = Math.cos(theta);
            let sinTheta = Math.sin(theta);
            return coords.map(([x, y]) => [x*cosTheta + y*sinTheta, -x*sinTheta + y*cosTheta]);
        },

        clearDrawnFeatures() {
            this.$refs.olSourceDrawTarget.clear(true);
        },

        async drawEndHandler({feature}) {
            if(this.nbActiveLayers > 0) {
                if(this.ongoingCalibration) {
                    await this.endDrawCalibration(feature);
                }
                else {
                    if(this.drawCorrection) {
                        await this.endCorrection(feature);
                    }
                    else {
                        await this.endDraw(feature);
                    }
                    this.clearDrawnFeatures();
                }
            }
            else {
                this.clearDrawnFeatures();
            }
        },

        endDrawCalibration(drawnFeature) {
            let geom = drawnFeature.getGeometry();
            if(geom.getType() != "LineString" || geom.getCoordinates().length != 2) {
                this.$nextTick(this.clearDrawnFeatures);
                this.$notify({type: "error", text: this.$t("calibration-annotation-must-be-segment")});
                return;
            }

            this.calibrationFeature = drawnFeature;
            this.calibrationModal = true;
        },

        endCalibration(resolution) {
            this.$store.dispatch("endCalibration", {idViewer: this.idViewer, index: this.index, resolution});
            this.endDraw(this.calibrationFeature);
        },

        async endDraw(drawnFeature) {
            this.activeLayers.forEach(async (layer, idx) => {
                let annot = new Annotation({
                    location: this.getWktLocation(drawnFeature),
                    image: this.image.id,
                    user: layer.id,
                    term: this.termsToAssociate
                });

                try {
                    await annot.save();
                    // TODO in backend: response should include userByTerm and correct value for term
                    // (https://github.com/cytomine/Cytomine-core/issues/1143)
                    annot.term = this.termsToAssociate.slice();
                    annot.userByTerm = this.termsToAssociate.map(term => {
                        return {term, user: [this.currentUser.id]};
                    });
                    // ----

                    this.$eventBus.$emit("addAnnotation", annot);
                    if(idx == this.nbActiveLayers - 1) {
                        this.$eventBus.$emit("selectAnnotation", {idViewer: this.idViewer, index: this.index, annot});
                    }

                    this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, annot, oldAnnot: null});
                }
                catch(err) {
                    console.log(err);
                    this.$notify({type: "error", text: this.$t("notif-error-annotation-creation")});
                }
            });
        },

        async endCorrection(feature) {
            let remove = (this.activeTool == "correct-remove");
            let review = false; // TODO: handle
            let geom = this.getWktLocation(feature);
            let idLayers = this.activeLayers.map(layer => layer.id);
            try {
                let correctedAnnot = await Annotation.correctAnnotations(this.image.id, geom, review, remove, idLayers);
                if(correctedAnnot != null) {
                    // TODO: add action for undo/redo system (currently not possible because core does not return the list of affected annotations)
                    this.$store.commit("resetActions", {idViewer: this.idViewer, index: this.index});

                    // refresh the sources because several annotations might have been modified
                    this.$eventBus.$emit("reloadAnnotations", this.image.id);
                }
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-correction")});
            }
        },

        getWktLocation(feature) {
            // transform circle to circular polygon
            let geometry = feature.getGeometry();
            if (geometry.getType() == "Circle") {
                feature.setGeometry(polygonFromCircle(geometry));
            }
            return this.format.writeFeature(feature);
        },
    }
};
</script>