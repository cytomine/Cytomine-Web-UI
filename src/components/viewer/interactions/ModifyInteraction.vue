<template>
<div>
    <vl-interaction-modify v-if="activeEditTool == 'modify'"
                           ref="olModifyInteraction"
                           :source="`select-target-${idViewer}-${index}`"
                           @modifyend="endEdit">
    </vl-interaction-modify>

    <vl-interaction-translate v-if="activeEditTool == 'translate'"
                              :source="`select-target-${idViewer}-${index}`"
                              @translateend="endEdit">
    </vl-interaction-translate>

    <vl-interaction-rotate v-if="activeEditTool == 'rotate'"
                           :source="`select-target-${idViewer}-${index}`"
                           @rotateend="endEdit">
    </vl-interaction-rotate>
</div>
</template>

<script>
import WKT from "ol/format/WKT";

export default {
    name: "modify-interaction",
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            format: new WKT(),
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        activeEditTool() {
            return this.imageWrapper.activeEditTool;
        },
    },
    methods: {
        async endEdit({features}) {
            features.forEach(async feature => {
                let annot = feature.get("annot").clone();
                if(annot == null) {
                    return;
                }

                let oldAnnot = annot.clone();
                try {
                    annot.location = this.format.writeFeature(feature);
                    await annot.save();
                    this.$eventBus.$emit("editAnnotation", annot);
                    this.$store.commit("addAction", {idViewer: this.idViewer, index: this.index, annot, oldAnnot});
                }
                catch(err) {
                    console.log(err);
                    this.$notify({type: "error", text: this.$t("notif-error-annotation-update")});
                    annot.location = oldAnnot.location;
                    feature.setGeometry(this.format.readGeometry(annot.location));
                }
            });
        },
    }
};
</script>