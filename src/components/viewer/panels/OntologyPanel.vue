<template>
<div class="ontology-panel">
    <h1>{{ $t("terms") }}</h1>

    <table class="table">
        <thead>
            <tr>
                <th class="checkbox-column"><span class="fa fa-eye"></span></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(term, index) in terms" :key="term.id">
                <td class="checkbox-column">
                    <input type="checkbox" :checked="term.visible" @change="toggleTermVisibility(index)">
                </td>
                <td>
                    <cytomine-term :term="term"></cytomine-term>
                </td>
            </tr>
            <tr>
                <td colspan="3"></td>
            </tr>
            <tr>
                <td class="checkbox-column">
                    <input type="checkbox" v-model="displayNoTerm">
                </td>
                <td>
                    {{ $t("no-term") }}
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import CytomineTerm from "@/components/utils/CytomineTerm";

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
        }
    },
    methods: {
        toggleTermVisibility(index) {
            this.$store.commit("toggleTermVisibility", {idViewer: this.idViewer, index: this.index, indexTerm: index});
        }
    }
};
</script>

<style scoped>
td, th {
    padding: 3px !important;
    font-size: 0.9em;
}

th.checkbox-column, td.checkbox-column {
    width: 25px;
    text-align: center !important;
}
</style>

<style>
.ontology-panel .checkbox .control-label {
    padding: 0px !important;
}
</style>
