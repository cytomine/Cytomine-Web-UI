<template>
<vl-interaction-select ident="select-target"
                       :filter="filterFunction" 
                       :features.sync="selectedFeatures"
                       :toggle-condition="never"
                       :remove-condition="shiftKeyOnly"
                       @select="select"
                       ref="interactionSelect">


    <vl-style-func :factory="styleFunctionFactory"></vl-style-func>
    
</vl-interaction-select>
</template>

<script>
import {isCluster} from "@/utils/style-utils.js";
import {never, shiftKeyOnly} from "ol/events/condition";

export default {
    name: "select-interaction",
    props: ["image"],
    computed: {
        imageWrapper() {
            return this.$store.state.images.images[this.image.id];
        },
        selectedFeatures: {
            get() {
                return this.imageWrapper.selectedFeatures;
            },
            set(value) {
                this.$store.commit("setSelectedFeatures", {idImage: this.image.id, selectedFeatures: value});
            }
        },
        styleFunctionFactory() {
            this.imageWrapper.selectedFeatures;
            this.imageWrapper.layersOpacity;
            this.imageWrapper.terms.forEach(term => term.visible);
            this.imageWrapper.displayNoTerm;
            this.imageWrapper.activeEditTool; // style is different in edit mode (vertices displayed)
            this.imageWrapper.selectedPropertyValues;
            this.imageWrapper.selectedPropertyColor;

            return () => {
                return this.$store.getters.genStyleFunction(this.image.id);
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
        select() {
            // TODO: save select action
        }
    }
};
</script>