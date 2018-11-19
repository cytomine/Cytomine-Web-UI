<!-- TODO: properties -->
<template>
<vl-layer-vector :visible="userLayer.visible"
                 :extent="imageExtent"
                 :update-while-interacting="false"> <!-- TODO: set to true to compare perfs -->

    <vl-source-vector ref="olSource"
                      @mounted="associateSource()"
                      :loader-factory="loaderFactory" 
                      :strategy-factory="strategyFactory"
                      url="-"> <!-- loader factory not used if URL not specified -->
    </vl-source-vector>

    <vl-style-func :factory="styleFunctionFactory"></vl-style-func>
</vl-layer-vector>
</template>

<script>
import { mapState } from "vuex";

import WKT from "ol/format/WKT";

import {AnnotationCollection} from "cytomine-client";

export default {
    name: "annotation-layer",
    data() {
        return {
            format: new WKT(),

            resolution: null,
            clustered: false,
            maxResolutionNoClusters: null,
        };
    },
    props: [
        "image",
        "userLayer"
    ],
    computed: {
        imageWrapper() {
            return this.images[this.image.id] || {};
        },

        annotsIdsToSelect() {
            return this.imageWrapper.annotsToSelect.map(annot => annot.id);
        },

        imageExtent() {
            return [0, 0, this.image.width, this.image.height];
        },

        styleFunctionFactory() {
            // Force computed property update when one of those properties change (leading to new style function =>
            // rerendering - see https://github.com/ghettovoice/vuelayers/issues/68#issuecomment-404223423)
            this.imageWrapper.selectedFeatures;
            this.imageWrapper.layersOpacity;
            this.imageWrapper.terms.forEach(term => term.visible);
            this.imageWrapper.displayNoTerm;
            this.imageWrapper.activeEditTool; // style is different in edit mode (vertices displayed)

            return () => {
                return this.$store.getters.genStyleFunction(this.image.id);
            };
        },

        ...mapState({images: state => state.images.images})
    },
    methods: {
        strategyFactory() {
            return (extent, resolution) => {
                if(this.resolution && this.clustered != null && // if some features have already been loaded
                ((resolution != this.resolution && this.clustered) // zoom modification while clustering is performed
                || (resolution >= this.resolution && !this.clustered && resolution > this.maxResolutionNoClusters))) { // re-cluster
                    // following clear(), selected feature is removed => need to cache it and reselect it based on ID
                    this.$store.commit("removeLayerFromSelectedFeatures",
                        {idImage: this.image.id, idLayer: this.userLayer.id, cache: true});
                    if(this.$refs.olSource) {
                        this.$refs.olSource.clear();
                    }
                }

                [0, 1].forEach(index => {
                    if(extent[index] < 0) {
                        extent[index] = 0;
                    }
                });
                [2, 3].forEach(index => {
                    if(this.imageExtent[index] < extent[index]) {
                        extent[index] = this.imageExtent[index];
                    }
                });

                return [extent];
            };
        },

        loaderFactory() {
            return async (extent, resolution) => { 
                this.resolution = resolution;
                let bbox = isFinite(extent[0]) ? extent.join() : [0, 0, this.image.width, this.image.height]; // TODO: check if needed
                let annots = await new AnnotationCollection({
                    user: this.userLayer.id,
                    image: this.image.id,
                    bbox,
                    showWKT: true,
                    showTerm: true,
                    kmeans: true
                }).fetchAll();

                if(annots.length > 0) {
                    if(annots.get(0).count) { // if a result has a count property, it means the annotations are clustered
                        this.clustered = true;
                    }
                    else {
                        this.clustered = false;
                        // TODO: add function in backend returning the maxResolutionNoClusters?
                        if(this.maxResolutionNoClusters == null || resolution > this.maxResolutionNoClusters) {
                            this.maxResolutionNoClusters = resolution;
                        }
                    }
                }

                if(this.$refs.olSource) {
                    this.$refs.olSource.addFeatures(this.createFeatures(annots.array));
                }
            };
        },

        createFeatures(annotations) {
            return annotations.map(annot => {
                let feature = this.format.readFeature(annot.location);
                feature.setId(annot.id); // TODO: fix issue in backend (same ID returned for different clusters) - use of uuid not a solution because same cluster gets rendered several times
                feature.set("annot", annot);

                if(this.annotsIdsToSelect.includes(annot.id)) {
                    this.$store.dispatch("selectFeature", {idImage: this.image.id, feature});
                }
                return feature;
            });
        },

        associateSource() {
            this.userLayer.olSource = this.$refs.olSource;
        }
    }
};
</script>
