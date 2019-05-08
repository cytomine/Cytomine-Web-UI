<template>
<vl-interaction-select :ident="`select-target-${idViewer}-${index}`"
                       :filter="filterFunction" 
                       :features.sync="selectedFeatures"
                       :toggle-condition="never"
                       :remove-condition="shiftKeyOnly"
                       @select="select"
                       ref="interactionSelect">


    <vl-style-func :factory="styleFunctionFactory" />
    
</vl-interaction-select>
</template>

<script>
import {isCluster} from "@/utils/style-utils.js";
import {never, shiftKeyOnly} from "ol/events/condition";

export default {
    name: "select-interaction",
    props: {
        idViewer: String,
        index: Number
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        selectedFeatures: {
            get() {
                return this.imageWrapper.selectedFeatures;
            },
            set(value) {
                this.$store.commit("setSelectedFeatures", {
                    idViewer: this.idViewer,
                    index: this.index,
                    selectedFeatures: value
                });
            }
        },
        terms() {
            return this.imageWrapper.terms || [];
        },
        styleFunctionFactory() {
            this.imageWrapper.selectedFeatures;
            this.imageWrapper.layersOpacity;
            this.terms.forEach(term => {
                term.visible;
                term.opacity;
            });
            this.imageWrapper.displayNoTerm;
            this.imageWrapper.noTermOpacity;
            this.imageWrapper.activeEditTool; // style is different in edit mode (vertices displayed)
            this.imageWrapper.selectedPropertyValues;
            this.imageWrapper.selectedPropertyColor;

            return () => {
                return this.$store.getters.genStyleFunction(this.idViewer, this.index);
            };
        },
        filterFunction() {
            return feature => !isCluster(feature);
        },
        never() {
            return never;
        },
        shiftKeyOnly() {
            return shiftKeyOnly;
        }
    },
    watch: {
        async styleFunctionFactory() {
            // HACK: style function is not called again when redefined => force the update of style for selected features
            if(this.$refs.interactionSelect && this.$refs.interactionSelect.$interaction) {
                await this.$refs.interactionSelect.$interaction.getFeatures().forEach(ft => ft.changed());
            }
        }
    },
    methods: {
        select({feature}) {
            let annot = feature.get("annot");
            annot.recordAction();
        }
    }
};
</script>