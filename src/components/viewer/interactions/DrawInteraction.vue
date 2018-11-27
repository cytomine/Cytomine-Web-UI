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
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        termsToAssociate() {
            return this.imageWrapper.terms.reduce((ids, term) => {
                if(term.associateToNewAnnot) {
                    ids.push(term.id);
                }
                return ids;
            }, []);
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
        activeLayers() {
            return this.layers.filter(layer => layer.drawOn);
        },
        nbActiveLayers() {
            return this.activeLayers.length;
        },
        drawSourceName() {
            return `draw-target-${this.idViewer}-${this.index}`;
        }
    },

    watch: {
        activeTool() {
            this.$refs.olDrawInteraction.scheduleRecreate();
        }
    },

    methods: {
        async drawEndHandler({feature}) {
            if(this.nbActiveLayers > 0) {
                if(this.drawCorrection) {
                    await this.endCorrection(feature);
                }
                else {
                    await this.endDraw(feature);
                }
            }

            this.$refs.olSourceDrawTarget.clear(true);
        },

        async endDraw(drawnFeature) {
            this.activeLayers.forEach(async (layer, idx) => {
                let annot = new Annotation({
                    location: this.getWktLocation(drawnFeature),
                    image: this.idImage,
                    user: layer.id,
                    term: this.termsToAssociate
                });

                try {
                    await annot.save();
                    // TODO in backend: response should include userByTerm and correct value for term
                    annot.term = this.termsToAssociate.slice();
                    annot.userByTerm = this.termsToAssociate.map(term => {
                        return {term, user: [this.currentUser.id]};
                    });
                    // ----
                    let feature = this.format.readFeature(annot.location);
                    feature.set("annot", annot);
                    feature.setId(annot.id);
                    layer.olSource.addFeature(feature);

                    if(idx == this.nbActiveLayers - 1) {
                        this.$store.dispatch("selectFeature", {idViewer: this.idViewer, index: this.index, feature});
                    }

                    this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, feature, oldAnnot: null});
                    // TODO this.$store.commit("incrementAnnotCount", {idViewer: this.idViewer, index: this.index, idLayer: annot.user});
                }
                catch(err) {
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
                let correctedAnnot = await Annotation.correctAnnotations(this.idImage, geom, review, remove, idLayers);
                if(correctedAnnot != null) {
                    let layer = this.activeLayers.find(layer => layer.id == correctedAnnot.user);
                    let correctedFeature = layer.olSource.getFeatureById(correctedAnnot.id);
                    if(correctedFeature != null) {
                        this.$store.commit("addAction", {
                            idViewer: this.idViewer,
                            index: this.index,
                            feature: correctedFeature,
                            oldAnnot: correctedFeature.get("annot")
                        });
                    }

                    // refresh the sources because several annotations might have been modified
                    this.activeLayers.map(layer => layer.olSource.clear());
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