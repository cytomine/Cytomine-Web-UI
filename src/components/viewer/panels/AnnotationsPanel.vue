<!-- TODO: handle review mode -->
<template>
<div class="layers">
    <h1>{{ $t("annotation-layers") }}</h1>
    <b-field>
        <b-select :placeholder="$t('select-layer')" size="is-small" v-model="selectedLayer">
            <option v-for="layer in unselectedLayers" :value="layer" :key="layer.id">
                {{ layerName(layer) }}
            </option>
        </b-select>
        <button class="button is-small" @click="addLayer()" :disabled="selectedLayer == null">{{ $t("button-add") }}</button>
    </b-field>
    <table class="table layers-table">
        <thead>
            <tr>
                <th class="checkbox-column"><span class="far fa-eye"></span></th>
                <th class="checkbox-column"><span class="fas fa-pencil-alt"></span></th>
                <th class="name-column"></th>
                <th class="checkbox-column"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(layer, index) in selectedLayers" :key="layer.id">
                <td class="checkbox-column">
                    <input type="checkbox" :checked="layer.visible" @change="toggleLayerVisibility(index)">
                </td>
                <td class="checkbox-column">
                    <input type="checkbox" :checked="layer.drawOn" @change="toggleLayerDrawOn(index)">
                </td>

                <td class="name-column">
                    {{ layerName(layer) }}
                </td>
                <td class="checkbox-column">
                    <button class="button is-small" @click="removeLayer(index)">
                        <span class="fas fa-times"></span>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="opacity">
        <label>{{ $t("layers-opacity") }}</label>
        <input class="slider is-fullwidth is-small" v-model="layersOpacity" step="0.05" min="0" max="1" type="range">
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";

import {Project} from "cytomine-client";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "annotations-panel",
    props: [
        "idViewer",
        "index",
        "layersToPreload"
    ],
    data() {
        return {
            layers: [], // Array<User> (representing user layers)
            indexLayers: [],
            selectedLayer: null
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        activePanel() {
            return this.imageWrapper.activePanel;
        },
        layersOpacity: {
            get() {
                return this.imageWrapper.layersOpacity;
            },
            set(value) {
                this.$store.commit("setLayersOpacity", {
                    idViewer: this.idViewer,
                    index: this.index,
                    opacity: Number(value)
                });
            }
        },

        selectedLayers() { // Array<User> (representing user layers)
            return this.imageWrapper.selectedLayers || [];
        },
        selectedLayersIds() {
            return this.selectedLayers.map(layer => layer.id);
        },
        unselectedLayers() {
            return this.layers.filter(layer => !this.selectedLayersIds.includes(layer.id));
        },

        ...mapState({currentUser: state => state.currentUser.user})
    },
    watch: {
        activePanel(panel) {
            this.fetchIndexLayers();
        }
    },
    methods: {
        annotationEventHandler(annot) {
            if(annot.image == this.image.id) {
                this.fetchIndexLayers();
            }
        },
        reloadAnnotationsHandler(idImage) {
            if(idImage == null || idImage == this.image.id) {
                this.fetchIndexLayers();
            }
        },

        layerName(layer) {
            let name = fullName(layer);

            let indexLayer = this.indexLayers.find(index => index.user == layer.id) || {};
            return `${name} (${indexLayer.countAnnotation || 0})`;
        },

        addLayerById(id) {
            let layer = this.layers.find(layer => layer.id == id);
            if(layer != null) {
                this.addLayer(layer);
            }
        },

        addLayer(layer = this.selectedLayer) {
            if(this.selectedLayersIds.includes(layer.id)) {
                return;
            }

            layer.visible = true;
            layer.drawOn = (layer.id == this.currentUser.id);
            this.$store.dispatch("addLayer", {idViewer: this.idViewer, index: this.index, layer});

            this.selectedLayer = null;
        },

        removeLayer(index, cacheSelectedFeatures=false) {
            this.$store.dispatch("removeLayer", {
                idViewer: this.idViewer,
                index: this.index,
                indexLayer: index,
                cacheSelectedFeatures
            });
        },

        toggleLayerVisibility(index) {
            this.$store.dispatch("toggleLayerVisibility", {
                idViewer: this.idViewer,
                index: this.index,
                indexLayer: index
            });
        },

        toggleLayerDrawOn(index) {
            this.$store.commit("toggleLayerDrawOn", {
                idViewer: this.idViewer,
                index: this.index,
                indexLayer: index
            });
        },

        async fetchLayers() {
            this.layers = (await new Project({id: this.image.project}).fetchUserLayers(this.image.id)).array;
        },

        async fetchIndexLayers(force=false) {
            if(!force && this.activePanel != "layers") {
                return;
            }
            this.indexLayers = await this.image.fetchAnnotationsIndex();
        }
    },
    async created() {
        await Promise.all([this.fetchLayers(), this.fetchIndexLayers(true)]);
        if(this.imageWrapper.selectedLayers == null) { // we do not use computed property selectedLayers because we don't want the replacement by [] if the store array is null
            this.addLayerById(this.currentUser.id);
        }

        if(this.layersToPreload != null) {
            this.layersToPreload.forEach(id => this.addLayerById(id));
        }
    },
    mounted() {
        this.$eventBus.$on(["addAnnotation", "deleteAnnotation"], this.annotationEventHandler);
        this.$eventBus.$on("reloadAnnotations", this.reloadAnnotationsHandler);
    },
    beforeDestroy() {
        this.$eventBus.$off(["addAnnotation", "deleteAnnotation"], this.annotationEventHandler);
        this.$eventBus.$off("reloadAnnotations", this.reloadAnnotationsHandler);
    }
};
</script>

<style>

.layers select {
    width: 220px;
}

.layers-table {
    margin-bottom: 10px !important;
    font-size: 0.9em;
}

.layers-table tbody {
    display:block;
    overflow:auto;
    max-height: 100px;
}

.layers-table thead tr {
   display: block;
}

.layers .table td, .layers .table th {
    padding: 3px !important;
    vertical-align: middle !important;
}

.layers td .button {
    width: 17px;
    height: 17px;
    padding: 0px;
}

th.checkbox-column, td.checkbox-column {
    width: 25px;
    text-align: center !important;
}

th.name-column, td.name-column {
    width: 200px;
}

.layers .checkbox .control-label {
    padding: 0px !important;
}

.layers input[type="range"].slider {
    margin: 0px;
}

.opacity {
    display: flex;
    align-items: center;
}

.opacity label {
    text-transform: uppercase;
    font-size: 11px;
    width: 150px;
}

</style>
