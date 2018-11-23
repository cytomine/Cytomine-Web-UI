<template>
<div>
    <vl-layer-vector>
        <vl-source-vector :ident="drawSourceName" ref="olSourceDrawTarget"></vl-source-vector>
    </vl-layer-vector>

    <vl-interaction-draw v-if="activeLayer"
                        ref="olDrawInteraction" 
                        :source="drawSourceName"
                        :type="objectDrawType"
                        :freehand="drawFreehand" 
                        :freehand-condition="undefined"
                        :geometry-function="drawGeometryFunction" 
                        @drawend="drawEndHandler">
    </vl-interaction-draw>
</div>
</template>

<script>
import {createBox} from "ol/interaction/Draw";
import {fromCircle as polygonFromCircle} from "ol/geom/Polygon";
import WKT from "ol/format/WKT";

import {Annotation} from "cytomine-client";

export default {
    name: "draw-interaction",
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            features: [],
            format: new WKT()
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        idImage() {
            return this.imageWrapper.imageInstance.id;
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
        objectDrawType() {
            // HACK: vuelayers triggers recreate() only for changes of type or source; but it needs to be triggered at 
            // each change of the active tool (required also for freeHand or geometryFunction changes) 
            // => return a String object, which will trigger the change even if the string value remains the same
            // Remark: calling the recreate() method manually leads to duplicate interactions
            return new String(this.drawType);
        },
        drawCorrection() {
            return this.activeTool == "correct-add" || this.activeTool == "correct-remove";
        },
        drawFreehand() {
            return this.activeTool == "freehand" || this.drawCorrection;
        },
        drawGeometryFunction() {
            return this.activeTool == "rectangle" ? createBox() : null;
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        activeLayer() {
            // TODO: treat multiple active layers
            return this.layers.find(layer => layer.drawOn);
        },
        activeSource() {
            if(this.activeLayer) {
                return this.activeLayer.olSource;
            }
        },
        drawSourceName() {
            return `draw-target-${this.idViewer}-${this.index}`;
        }
    },

    methods: {
        async drawEndHandler({feature}) {
            if(this.drawCorrection) {
                await this.endCorrection(feature);
            }
            else {
                await this.endDraw(feature);
            }

            this.$refs.olSourceDrawTarget.clear(true);
        },

        async endDraw(feature) {
            if(this.activeLayer == null) {
                return;
            }
            let user = this.activeLayer.id;
            let annot = new Annotation({location: this.getWktLocation(feature), image: this.idImage, user});
            try {
                await annot.save();
                feature.set("annot", annot);
                feature.setId(annot.id);
                this.activeSource.addFeature(feature);
                this.$store.dispatch("selectFeature", {idViewer: this.idViewer, index: this.index, feature});

                this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, feature, oldAnnot: null});
                // TODO this.$store.commit("incrementAnnotCount", {idViewer: this.idViewer, index: this.index, idLayer: annot.user});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-creation")});
            }
        },

        async endCorrection(feature) {
            if(this.activeLayer == null) {
                return;
            }
            let remove = (this.activeTool == "correct-remove");
            let review = false; // TODO: handle
            let geom = this.getWktLocation(feature);
            let idLayer = this.activeLayer.id;
            try {
                let correctedAnnot = await Annotation.correctAnnotations(this.idImage, geom, review, remove, [idLayer]);
                if(correctedAnnot != null) {
                    let correctedFeature = this.activeSource.getFeatureById(correctedAnnot.id);
                    if(correctedFeature == null) {
                        return;
                    }
                    
                    this.$store.commit("addAction", {
                        idViewer: this.idViewer,
                        index: this.index,
                        feature: correctedFeature, 
                        oldAnnot: correctedFeature.get("annot")
                    });

                    correctedFeature.set("annot", correctedAnnot);
                    correctedFeature.setId(correctedAnnot.id);
                    correctedFeature.setGeometry(new WKT().readGeometry(correctedAnnot.location));

                    this.$store.dispatch("selectFeature", {
                        idViewer: this.idViewer,
                        index: this.index,
                        feature: correctedFeature
                    });

                    // refresh the source because several annotations might have been modified
                    this.activeSource.clear();
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