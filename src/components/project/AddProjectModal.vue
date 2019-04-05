<template>
<b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
    <form>
        <div class="modal-card add-image-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t("create-project")}}</p>
            </header>
            <section class="modal-card-body">
                <b-field :label="$t('name')"
                         :type="!validName && displayErrors ? 'is-danger' : null"
                         :message="!validName && displayErrors ? $t('field-cannot-be-empty') : ''">
                    <b-input v-model="name" />
                </b-field>

                <b-field :label="$t('ontology')">
                    <b-radio v-model="ontology" native-value="NO">
                        {{$t("no-ontology")}}
                    </b-radio>
                </b-field>
                <b-field>
                    <b-radio v-model="ontology" native-value="NEW">
                        {{$t("create-ontology-for-project")}}
                    </b-radio>
                </b-field>
                <b-field>
                    <b-radio v-model="ontology" native-value="EXISTING">
                        {{$t("use-existing-ontology")}}
                    </b-radio>
                </b-field>

                <b-collapse class="panel" :open="ontology === 'EXISTING'">
                    <b-field :type="!validOntology && displayErrors ? 'is-danger' : null"
                            :message="!validOntology && displayErrors ? $t('ontology-must-be-selected') : ''">
                        <b-select size="is-small" v-model="selectedOntology" :placeholder="$t('select-ontology')">
                            <option v-for="ontology in ontologies" :value="ontology.id" :key="ontology.id">
                                {{ontology.name}}
                            </option>
                        </b-select>
                    </b-field>
                </b-collapse>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$emit('update:active', false)">
                    {{$t("button-cancel")}}
                </button>
                <button class="button is-link" :disabled="(!validName || !validOntology) && displayErrors" @click="createProject()">
                    {{$t("button-save")}}
                </button>
            </footer>
        </div>
    </form>
</b-modal>
</template>

<script>
import {Project, Ontology, OntologyCollection} from "cytomine-client";

export default {
    name: "add-project-modal",
    props: {
        active: Boolean
    },
    data() {
        return {
            name: "",
            ontology: "NO",
            ontologies: [],
            selectedOntology: null,
            displayErrors: false
        };
    },
    computed: {
        validName() {
            return this.name.length > 0;
        },
        validOntology() {
            return this.ontology !== "EXISTING" || this.selectedOntology;
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.name = "";
                this.ontology = "NO";
                this.selectedOntology = null;
                this.displayErrors = false;
            }
        }
    },
    methods: {
        async createProject() {
            if(!this.validName || !this.validOntology) {
                this.displayErrors = true;
                return;
            }

            try {
                let idOntology;
                if(this.ontology === "NEW") {
                    let ontology = await new Ontology({name: this.name}).save();
                    idOntology = ontology.id;
                }
                else if(this.ontology === "EXISTING") {
                    idOntology = this.selectedOntology.id;
                }

                let project = await new Project({name: this.name, ontology: idOntology}).save();
                this.$notify({type: "success", text: this.$t("notif-success-project-creation")});
                this.$router.push(`/project/${project.id}/configuration`);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-project-creation")});
            }
        }
    },
    async created() {
        this.ontologies = (await OntologyCollection.fetchAll({light: true})).array;
        this.ontologies.sort((a, b) => a.name.localeCompare(b.name));
    }
};
</script>
