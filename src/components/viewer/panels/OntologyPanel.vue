<template>
<div class="ontology-panel">
    <h1>{{ $t("terms") }}</h1>

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
</div>
</template>

<script>
export default {
    name: "ontology-panel",
    props: ["image"],
    computed: {
        imageWrapper() {
            return this.$store.state.images.images[this.image.id];
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
        }
    },
    methods: {
        toggleTermVisibility(index) {
            this.$store.commit("toggleTermVisibility", {idImage: this.image.id, indexTerm: index});
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

th.name-column, td.name-column {
    width: 200px;
}

.color-preview {
    width: 15px;
    height: 15px;
    margin-top: 2px;
    border-radius: 3px;
    box-shadow: 0px 0px 1px #777;
}
</style>

<style>
.ontology-panel .checkbox .control-label {
    padding: 0px !important;
}
</style>
