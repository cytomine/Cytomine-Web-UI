<template>
<div class="ontology-panel">
    <h1>{{ $t("terms") }}</h1>
    <div class="ontology-tree-wrapper">
        <div class="header-tree">
            <b-input v-model="searchString" :placeholder="$t('search-placeholder')" size="is-small" expanded></b-input>

            <div class="sidebar-tree">
                <div class="visibility">
                    <i class="far fa-eye"></i>
                </div>
                <div class="opacity">{{$t("opacity")}}</div>
            </div>
        </div>
        <ontology-tree :ontology="ontology"
                       :allowSelection="false"
                       :searchString="searchString"
                       :additionalNodes="additionalNodes">
            <template #custom-sidebar="{term}">
                <div class="sidebar-tree">
                    <div class="visibility">
                        <input v-if="term.id"
                            type="checkbox"
                            :checked="terms[termsMapping[term.id]].visible"
                            @change="toggleTermVisibility(termsMapping[term.id])">

                        <input v-else type="checkbox" v-model="displayNoTerm">
                    </div>

                    <div class="opacity">
                        <input v-if="term.id"
                            class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                            :disabled="!terms[termsMapping[term.id]].visible"
                            :value="terms[termsMapping[term.id]].opacity"
                            @change="event => changeOpacity(termsMapping[term.id], event)"
                            @input="event => changeOpacity(termsMapping[term.id], event)">

                        <input v-else
                            class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                            v-model="noTermOpacity">
                    </div>
                </div>
            </template>
        </ontology-tree>
    </div>
    <div class="has-text-right">
        <button class="button is-small" @click="resetOpacities()">{{$t("button-reset-opacities")}}</button>
    </div>
</div>
</template>

<script>
import OntologyTree from "@/components/ontology/OntologyTree";

export default {
    name: "ontology-panel",
    components: {OntologyTree},
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            searchString: ""
        };
    },
    computed: {
        ontology() {
            return this.$store.state.project.ontology;
        },
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        terms() {
            return this.imageWrapper.terms;
        },
        termsMapping() {
            let mapping = {};
            this.terms.forEach((term, idx) => mapping[term.id] = idx);
            return mapping;
        },
        additionalNodes() {
            return [{id: 0, name: this.$t("no-term")}];
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

.ontology-tree-wrapper {
    max-height: 185px;
    overflow: auto;
    margin-bottom: 5px !important;
}


input[type="range"].slider {
    margin: 0px;
}

.header-tree {
    display: flex;
    justify-content: right;
    position: sticky;
    top: 0px;
    z-index: 5;
    padding-bottom: 3px;
    background: #f2f2f2;
    border: 2px solid #DBDBDB;
    border-width: 0px 0px 2px !important;
}

.header-tree .opacity {
    text-align: center;
    text-transform: uppercase;
    font-size: 11px;
}

.sidebar-tree {
    padding-right: 5px;
    display: flex;
    align-items: center;
}

.visibility {
    width: 30px;
    height: 25px;
    display: flex;
    justify-content: center;
}

.header-tree .visibility {
    height: unset;
}

.opacity {
    width: 80px;
    display: block;
}
</style>

<style>
.ontology-panel .checkbox .control-label {
    padding: 0px !important;
}

.ontology-panel .ontology-tree .sl-vue-tree-node-item, .ontology-panel .ontology-tree .no-result {
    line-height: 2;
    font-size: 0.9em;
}
</style>
