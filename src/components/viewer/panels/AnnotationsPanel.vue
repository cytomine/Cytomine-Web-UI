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
                <th class="checkbox-column"><span class="fa fa-eye"></span></th>
                <th class="checkbox-column"><span class="fa fa-pencil"></span></th>
                <th class="checkbox-column"><span class="fa fa-lock"></span></th>
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
                    <input type="checkbox" :checked="layer.drawOn"> <!-- TODO -->
                </td>
                <td class="checkbox-column">
                    <input type="checkbox" :checked="layer.locked"> <!-- TODO -->
                </td>
                <td class="name-column">
                    {{ layerName(layer) }}
                </td>
                <td class="checkbox-column">
                    <button class="button is-small" @click="removeLayer(index)">
                        <span class="fa fa-times"></span>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="opacity">
        <label>{{ $t("layers-opacity") }}</label>
        <input class="slider is-fullwidth is-small" v-model="layersOpacity" step="0.05" min="0" max="1" type="range">
    </div>

    <template v-if="terms.length > 0">
    <h3>{{ $t("terms") }}</h3>

    <table class="table">
        <thead>
            <tr>
                <th class="checkbox-column"><span class="fa fa-eye"></span></th>
                <th class="checkbox-column"></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(term, index) in terms" :key="term.id">
                <td class="checkbox-column">
                    <input type="checkbox" :checked="term.visible" @change="toggleTermVisibility(index)">
                </td>
                <td class="checkbox-column">
                    <div class="color-preview" :style="{background: term.color}"></div>
                </td>
                <td class="name-column">
                    {{term.name}}
                </td>
            </tr>
            <tr>
                <td colspan="3"></td>
            </tr>
            <tr>
                <td class="checkbox-column">
                    <input type="checkbox" v-model="displayNoTerm">
                </td>
                <td class="checkbox-column"></td>
                <td class="name-column">
                    {{ $t("no-term") }}
                </td>
            </tr>
        </tbody>
    </table>
    </template>
</div>
</template>

<script>
import { mapState } from "vuex";

import {Project} from "cytomine-client";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "annotations-panel",
    props: ["image"],
    data() {
        return {
            layers: [], // Array<User> (representing user layers)
            selectedLayer: null
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.images[this.image.id];
        },
        layersOpacity: {
            get() {
                return this.imageWrapper.layersOpacity;
            },
            set(value) {
                this.$store.commit("setLayersOpacity", {idImage: this.image.id, opacity: Number(value)});
            }
        },
        terms() {
            return this.imageWrapper.terms;
        },
        displayNoTerm: {
            get() {
                return this.imageWrapper.displayNoTerm;
            },
            set(value) {
                this.$store.commit("setDisplayNoTerm", {idImage: this.image.id, value});
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
    methods: {
        layerName(layer) {
            let name = "";
            if(layer.algo) {
                let date = this.$options.filters.moment(Number(layer.created), "DD/MM/YYYY, HH:mm");
                name = `${layer.softwareName} - ${date}`;
            }
            else {
                name = fullName(layer);
            }

            return `${name} (${layer.countAnnotation})`;
        },

        addLayer(layer = this.selectedLayer) {
            if(this.selectedLayersIds.includes(layer.id)) {
                return;
            }

            layer.visible = true;
            layer.drawOn = (layer.id == this.currentUser.id);
            layer.locked = false;
            this.$store.commit("addLayer", {idImage: this.image.id, layer});

            this.selectedLayer = null;
        },

        removeLayer(index, cacheSelectedFeatures=false) {
            this.$store.dispatch("removeLayer", {idImage: this.image.id, indexLayer: index, cacheSelectedFeatures});
        },

        toggleLayerVisibility(index) {
            this.$store.dispatch("toggleLayerVisibility", {idImage: this.image.id, indexLayer: index});
        },

        toggleTermVisibility(index) {
            this.$store.commit("toggleTermVisibility", {idImage: this.image.id, indexTerm: index});
        },

        async loadLayers() {
            let layersPromise = new Project({id: this.image.project}).fetchUserLayers(this.image.id);
            let indexLayersPromise = this.image.fetchAnnotationsIndex();

            let collectionLayers = await layersPromise;
            let indexLayers = await indexLayersPromise;
            this.layers = collectionLayers.array;
            this.layers.forEach(layer => { // TODO: externalize that in client ?
                let indexLayer = indexLayers.find(index => index.user == layer.id);
                if(indexLayer == null) {
                    layer.countAnnotation = 0;
                    layer.countReviewedAnnotation = 0;
                }
                else {
                    layer.countAnnotation = indexLayer.countAnnotation;
                    layer.countReviewedAnnotation = indexLayer.countReviewedAnnotation;
                }
            });
        }
    },
    async created() {
        await this.loadLayers();
        if(this.imageWrapper.selectedLayers == null) { // we do not use computed property selectedLayers because we don't want the replacement by [] if the store array is null
            // TODO: move in store?
            let currentUserLayer = this.layers.find(layer => layer.id == this.currentUser.id);
            if(currentUserLayer != null) {
                this.addLayer(currentUserLayer);
            }
        }
    }
};
</script>

<style>

.layers select {
    width: 220px;
}

.layers-table {
    margin-bottom: 10px !important;
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

.layers h3 {
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding-bottom: 2px;
    margin-bottom: 5px;
    margin-top: 10px;
    border-bottom: 2px solid #ddd;
}

.color-preview {
    width: 15px;
    height: 15px;
    margin-top: 2px;
    border-radius: 3px;
    box-shadow: 0px 0px 1px #777;
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
