
<template>
<div>
    <table>
        <tr>
            <td>{{ $t("hue") }}</td>
            <td class="metrics">{{hue}} °</td>
            <td><input class="slider is-fullwidth is-small" v-model="hue" type="range" min="-180" max="180"></td>
        </tr>
        <tr>
            <td>{{ $t("chroma") }}</td>
            <td>{{chroma}}</td>
            <td><input class="slider is-fullwidth is-small" v-model="chroma" type="range" min="-100" max="100"></td>
        </tr>
        <tr>
            <td>{{ $t("lightness") }}</td>
            <td>{{lightness}}</td>
            <td><input class="slider is-fullwidth is-small" v-model="lightness" type="range" min="-100" max="100"></td>
        </tr>
    </table>
</div>
</template>

<script>
import _ from "lodash";

const debounceDelay = 500;

export default {
    name: "color-manipulation",
    props: [
        "idViewer",
        "index",
    ],
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        hue: {
            get() {
                return this.imageWrapper.hue;
            },
            set(value) {
                this.setHue(value);
            }
        },
        lightness: {
            get() {
                return this.imageWrapper.lightness - 100;
            },
            set(value) {
                this.setLightness(100 + Number(value));
            }
        },
        chroma: {
            get() {
                return this.imageWrapper.chroma - 100;
            },
            set(value) {
                this.setChroma(100 + Number(value));
            }
        },
    },
    methods: {
        setHue: _.debounce(function(value) {
            this.$store.commit("setHue", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        setLightness: _.debounce(function(value) {
            this.$store.commit("setLightness", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),

        setChroma: _.debounce(function(value) {
            this.$store.commit("setChroma", {idViewer: this.idViewer, index: this.index, value});
        }, debounceDelay),
    }
};
</script>

<style scoped>
td, tr {
    vertical-align: middle !important;
}

.metrics {
    width: 48px;
}

input[type="range"].slider {
    margin-top: 3px;
    margin-bottom: 3px;
}
</style>
