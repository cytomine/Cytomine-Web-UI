
<template>
<div class="color-manipulation">
    <h1>{{$t("colors")}}</h1>
    <table>
        <tr>
            <td class="name">{{ $t("brightness") }}</td>
            <td>
                <cytomine-slider v-model="brightness" :min="-255" :max="255" :revision="revisionSliders" />
            </td>
        </tr>
        <tr>
            <td class="name">{{ $t("contrast") }}</td>
            <td>
                <cytomine-slider v-model="contrast" :min="-255" :max="255" :revision="revisionSliders" />
            </td>
        </tr>
        <tr>
            <td class="name">{{ $t("saturation") }}</td>
            <td>
                <cytomine-slider v-model="saturation" :min="-100" :max="100" :revision="revisionSliders" />
            </td>
        </tr>
        <tr>
            <td class="name">{{ $t("hue") }}</td>
            <td>
                <cytomine-slider v-model="hue" :min="-180" :max="180" :revision="revisionSliders" />
            </td>
        </tr>
    </table>
    <div class="actions">
        <button class="button is-small" @click="reset()">{{$t("button-reset")}}</button>
    </div>
</div>
</template>

<script>
import _ from "lodash";
import CytomineSlider from "@/components/form/CytomineSlider";

const debounceDelay = 500;

export default {
    name: "color-manipulation",
    components: {CytomineSlider},
    props: {
        idViewer: String,
        index: Number
    },
    data() {
        return {
            revisionSliders: 0
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        activePanel() {
            return this.imageWrapper.activePanel;
        },

        brightness: {
            get() {
                return this.imageWrapper.brightness;
            },
            set(value) {
                this.setBrightness(value);
            }
        },
        contrast: {
            get() {
                return this.imageWrapper.contrast;
            },
            set(value) {
                this.setContrast(value);
            }
        },
        hue: {
            get() {
                return this.imageWrapper.hue;
            },
            set(value) {
                this.setHue(value);
            }
        },
        saturation: {
            get() {
                return this.imageWrapper.saturation;
            },
            set(value) {
                this.setSaturation(value);
            }
        }
    },
    watch: {
        activePanel(panel) {
            if(panel === "colors") {
                this.revisionSliders++;
            }
        }
    },
    methods: {
        reset() {
            this.$store.commit("resetColorManipulation", {idViewer: this.idViewer, index: this.index});
        },

        setBrightness: _.debounce(function(value) {
            this.$store.commit("setBrightness", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        setContrast: _.debounce(function(value) {
            this.$store.commit("setContrast", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        setHue: _.debounce(function(value) {
            this.$store.commit("setHue", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        setSaturation: _.debounce(function(value) {
            this.$store.commit("setSaturation", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        updateMapSize() {
            this.revisionSliders++;
        }
    },
    mounted() {
        this.$eventBus.$on("updateMapSize", this.updateMapSize);
    },
    beforeDestroy() {
        this.$eventBus.$off("updateMapSize", this.updateMapSize);
    }
};
</script>

<style scoped>
td, tr {
    vertical-align: middle !important;
}

td.name {
    font-weight: 600;
    text-align: right;
    padding: 4px;
}

td:not(.name) {
    width: 100%;
}

.metrics {
    width: 48px;
}

input[type="range"].slider {
    margin-top: 3px;
    margin-bottom: 3px;
}

.actions {
    margin-top: 10px;
    text-align: right;
}
</style>

<style>
.color-manipulation .vue-slider {
    margin-left: 5px;
    margin-right: 50px;
}
</style>
