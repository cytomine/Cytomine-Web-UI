<template>
<vl-layer-vector :visible="userLayer.visible"
                 :extent="imageExtent"
                 :update-while-interacting="false"> <!-- TODO: set to true to compare perfs -->

    <vl-source-vector ref="olSource"
                      @mounted="associateSource()"
                      :loader-factory="loaderFactory" 
                      :strategy-factory="strategyFactory"
                      url="-"> <!-- loader factory not used if URL not specified -->
        <vl-style-func :factory="styleFunctionFactory"></vl-style-func>
    </vl-source-vector>

</vl-layer-vector>
</template>

<script>
import WKT from "ol/format/WKT";

import {AnnotationCollection} from "cytomine-client";

export default {
    name: "annotation-layer",
    props: [
        "idViewer",
        "index",
        "userLayer"
    ],
    data() {
        return {
            format: new WKT(),

            resolution: null,
            clustered: null,
            maxResolutionNoClusters: null,

            lastExtent: null,

            refreshTimeout: null
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        annotsIdsToSelect() {
            return this.imageWrapper.annotsToSelect.map(annot => annot.id);
        },
        imageExtent() {
            return [0, 0, this.image.width, this.image.height];
        },
        selectedFeatures() {
            return this.imageWrapper.selectedFeatures;
        },
        activeTool() {
            return this.imageWrapper.activeTool;
        },
        activeEditTool() {
            return this.imageWrapper.activeEditTool;
        },
        styleFunctionFactory() {
            // Force computed property update when one of those properties change (leading to new style function =>
            // rerendering - see https://github.com/ghettovoice/vuelayers/issues/68#issuecomment-404223423)
            this.imageWrapper.selectedFeatures;
            this.imageWrapper.layersOpacity;
            this.imageWrapper.terms.forEach(term => term.visible);
            this.imageWrapper.displayNoTerm;
            this.imageWrapper.selectedPropertyKey;
            this.imageWrapper.selectedPropertyColor;

            return () => {
                return this.$store.getters.genStyleFunction(this.idViewer, this.index);
            };
        }
    },
    methods: {
        strategyFactory() {
            return (extent, resolution) => {
                this.lastExtent = extent;

                // if some features have already been loaded
                if(this.$refs.olSource && this.resolution && this.clustered != null) {

                    // if it is needed to recluster features
                    if(resolution > this.resolution && !this.clustered && resolution > this.maxResolutionNoClusters) {
                        // re-cluster => remove all features
                        // following clear(), selected feature is removed => need to cache it and reselect it based on ID
                        this.$store.commit("removeLayerFromSelectedFeatures", {
                            idViewer: this.idViewer,
                            index: this.index,
                            idLayer: this.userLayer.id,
                            cache: true
                        });

                        this.$refs.olSource.clear();
                    }

                    // if clustering is ongoing and there is a change of resolution
                    else if(resolution != this.resolution && this.clustered) {
                        // clear loaded extents to force reloading features
                        this.$refs.olSource.$source.loadedExtentsRtree_.clear();
                    }
                }

                return [extent];
            };
        },

        async fetchAnnots(extent) {

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

            let annots = await new AnnotationCollection({
                user: this.userLayer.id,
                image: this.image.id,
                bbox: extent.join(),
                showWKT: true,
                showTerm: true,
                showGIS: true,
                kmeans: true
            }).fetchAll();

            return annots.array;
        },

        updateFeature(feature, annot) {
            let selectedFeature = this.selectedFeatures.find(ftr => ftr.id == feature.getId());

            if(annot == null) {
                this.$refs.olSource.removeFeature(feature);
                if(selectedFeature != null) {
                    this.$store.commit("clearSelectedFeatures", {idViewer: this.idViewer, index: this.index});
                }
                return;
            }

            let storedAnnot = feature.get("annot");
            if(!this.clustered && annot.updated == storedAnnot.updated && this.sameTerms(annot.term, storedAnnot.term)) {
                // no modification performed since feature was loaded
                return;
            }

            if(selectedFeature != null) {
                if(this.activeTool == "select" && this.activeEditTool != null) {
                    // if feature is selected and under modification, updating it may lead to conflict
                    return;
                }
                selectedFeature.properties.annot = annot;
            }

            feature.set("annot", annot);
            feature.setGeometry(this.format.readGeometry(annot.location));
        },

        async loadFeatures(extent, resolution) {
            if(!this.userLayer.visible || this.$refs.olSource == null || extent == null) {
                return;
            }

            // TODO: test performances
            // TODO: in core, add method allowing to retrieve only created/updated/deleted annotations since a given
            // timestamp? would probably be more efficient than current approach
            let arrayAnnots = await this.fetchAnnots(extent);

            if(arrayAnnots.length == 0) {
                return;
            }

            this.clustered = (arrayAnnots[0].count != null);
            if(!this.clustered && resolution > this.maxResolutionNoClusters) {
                this.maxResolutionNoClusters = resolution;
            }

            let annots = arrayAnnots.reduce((obj, annot) => {
                obj[annot.id] = annot;
                return obj;
            }, {});
            let seenAnnots = [];

            let features = this.clustered ? this.$refs.olSource.$source.getFeatures()
                : this.$refs.olSource.$source.getFeaturesInExtent(extent);

            features.forEach(feature => {
                this.updateFeature(feature, annots[feature.getId()]);
                seenAnnots.push(feature.getId());
            });

            arrayAnnots.forEach(annot => {
                if(!seenAnnots.includes(annot.id)) {
                    this.$refs.olSource.addFeature(this.createFeature(annot));
                }
            });
        },

        async loader(extent=this.lastExtent, resolution=this.resolution) {
            this.resolution = resolution;

            await this.loadFeatures(extent, resolution);
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = setTimeout(() => this.loader(), 5000);
        },

        loaderFactory() {
            return (extent, resolution) => this.loader(extent, resolution);
        },

        createFeature(annot) {
            let feature = this.format.readFeature(annot.location);
            feature.setId(annot.id);
            feature.set("annot", annot);

            if(this.annotsIdsToSelect.includes(annot.id)) {
                this.$store.dispatch("selectFeature", {idViewer: this.idViewer, index: this.index, feature});
            }

            return feature;
        },

        associateSource() {
            this.userLayer.olSource = this.$refs.olSource; // TODO in store
        },

        sameTerms(terms1, terms2) {
            if(terms1.length != terms2.length) {
                return false;
            }
            return terms1.every(term => terms2.includes(term));
        }
    },
    beforeDestroy() {
        clearTimeout(this.refreshTimeout);
    }
};
</script>
