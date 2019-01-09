<template>
<div class="ontology-panel">
    <h1>{{ $t("terms") }}</h1>
    <div class="table-wrapper">
        <table class="table">
            <thead>
                <tr>
                    <th>
                        <div class="th-wrap"><span class="far fa-eye"></span></div>
                    </th>
                    <th>
                        <div class="th-wrap"></div>
                    </th>
                    <th>
                        <div class="th-wrap">{{$t("opacity")}}</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(term, index) in terms" :key="term.id">
                    <td>
                        <input type="checkbox" :checked="term.visible" @change="toggleTermVisibility(index)">
                    </td>
                    <td>
                        <cytomine-term :term="term"></cytomine-term>
                    </td>
                    <td>
                        <input class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                               :value="term.opacity"
                               @change="event => changeOpacity(index, event)"
                               @input="event => changeOpacity(index, event)">
                    </td>
                </tr>
                <tr>
                    <td>
                        <input type="checkbox" v-model="displayNoTerm">
                    </td>
                    <td>
                        {{ $t("no-term") }}
                    </td>
                    <td>
                        <input class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                               v-model="noTermOpacity">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="has-text-right">
        <button class="button is-small" @click="resetOpacities()">{{$t("button-reset-opacities")}}</button>
    </div>
</div>
</template>

<script>
import CytomineTerm from "@/components/term/CytomineTerm";

export default {
    name: "ontology-panel",
    components: {CytomineTerm},
    props: [
        "idViewer",
        "index"
    ],
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        terms() {
            return this.imageWrapper.terms;
        },
        displayNoTerm: {
            get() {
                return this.imageWrapper.displayNoTerm;
            },
            set(value) {
                this.$store.commit("setDisplayNoTerm", {idViewer: this.idViewer, index: this.index, value});
            }
        },
        noTermOpacity: {
            get() {
                return this.imageWrapper.noTermOpacity;
            },
            set(value) {
                this.$store.commit("setNoTermOpacity", {
                    idViewer: this.idViewer,
                    index: this.index,
                    opacity: Number(value)
                });
            }
        },
    },
    methods: {
        toggleTermVisibility(index) {
            this.$store.commit("toggleTermVisibility", {idViewer: this.idViewer, index: this.index, indexTerm: index});
        },
        changeOpacity(index, event) {
            let opacity = event.target.value;
            this.$store.commit("setTermOpacity", {idViewer: this.idViewer, index: this.index, indexTerm: index, opacity});
        },
        resetOpacities() {
            this.$store.commit("resetTermOpacities", {idViewer: this.idViewer, index: this.index});
        }
    }
};
</script>

<style scoped>
.ontology-panel h1 {
    padding-bottom: 10px !important;
}

.table-wrapper {
    max-height: 180px;
    overflow: auto;
    margin-bottom: 5px !important;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
}

td, th {
    padding: 3px !important;
    font-size: 0.9em;
    word-wrap: break-word !important;
}

th {
    text-align: center !important;
    position: sticky;
    top: 0px;
    z-index: 5;
    background: #f2f2f2;
    border-width: 0px 0px 2px !important;
}

th:last-child {
    text-transform: uppercase;
    font-weight: normal;
    font-size: 11px;
}

th:first-child, td:first-child {
    width: 25px;
    text-align: center !important;
}

th:last-child, td:last-child {
    width: 100px;
}

input[type="range"].slider {
    margin: 0px;
}

tr:last-child td {
    border-top-width: 1px;
}

</style>

<style>
.ontology-panel .checkbox .control-label {
    padding: 0px !important;
}
</style>
