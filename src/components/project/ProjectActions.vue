<template>
<div class="project-actions-wrapper">
    <b-modal :active="isRenameModalActive" has-modal-card @close="isRenameModalActive = false">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("rename-project")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-field :label="$t('new-name')"
                             :type="emptyNewName ? 'is-danger' : null"
                             :message="emptyNewName ? $t('field-cannot-be-empty') : ''">
                        <b-input v-model="newName" />
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="isRenameModalActive = false">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" @click="rename()" :disabled="emptyNewName">
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>

    <b-modal :active="isOntologyModalActive" has-modal-card @close="isOntologyModalActive = false">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("change-ontology")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-message v-if="errorOntologies" type="is-danger" has-icon icon-size="is-small">
                        <h2> {{ $t("error") }} </h2>
                        <p> {{ $t("unexpected-error-info-message") }} </p>
                    </b-message>
                    <template v-else>
                        <b-message v-if="project.ontology" type="is-warning" has-icon icon-size="is-small">
                            {{$t("change-ontology-warning-message")}}
                        </b-message>
                        <b-field :label="$t('ontology')">
                            <b-select
                                v-model="selectedOntology"
                                :placeholder="$t('no-ontology')"
                                :disabled="loadingOntologies"
                                :loading="loadingOntologies"
                            >
                                <option :value="null">
                                    {{$t('no-ontology')}}
                                </option>
                                <option v-for="ontology in ontologies" :value="ontology.id" :key="ontology.id">
                                    {{ontology.name}}
                                </option>
                            </b-select>
                        </b-field>
                    </template>
                </section>
                <footer class="modal-card-foot">
                    <button
                        class="button"
                        type="button"
                        @click="isOntologyModalActive = false"
                        :disabled="savingOntology"
                    >
                        {{$t("button-cancel")}}
                    </button>
                    <button
                        v-if="!errorOntologies"
                        class="button is-link"
                        :class="{'is-loading': savingOntology}"
                        @click="saveOntology()"
                        :disabled="loadingOntologies || savingOntology"
                    >
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>

    <div class="buttons">
        <button class="button" :class="size" @click="isRenameModalActive = true">
            {{$t("button-rename")}}
        </button>
        <button class="button" :class="size" @click="isOntologyModalActive = true" :disabled="cannotDeleteOntology">
            {{$t("button-change-ontology")}}
        </button>
        <button class="button is-danger" :class="size" @click="deleteProject()">
            {{$t("button-delete")}}
        </button>
    </div>
</div>
</template>

<script>
import {OntologyCollection} from "cytomine-client";

export default {
    name: "project-actions",
    props: {
        project: {type: Object},
        size: {type: String, default: "is-small"}
    },
    data() {
        return {
            isRenameModalActive: false,
            newName: "",

            isOntologyModalActive: false,
            loadingOntologies: true,
            errorOntologies: false,
            ontologies: null,
            selectedOntology: null,
            cannotDeleteOntology: false,
            savingOntology: false
        };
    },
    computed: {
        emptyNewName() {
            return !this.newName;
        }
    },
    watch: {
        isRenameModalActive(val) {
            if(val) {
                this.newName = this.project.name;
            }
        },
        async isOntologyModalActive(val) {
            if(val) {
                if(this.loadingOntologies) { // first opening of the ontology modal => load ontologies
                    try {
                        this.ontologies = (await OntologyCollection.fetchAll({light: true})).array;
                        this.ontologies.sort((a, b) => a.name.localeCompare(b.name));
                        this.loadingOntologies = false;
                    }
                    catch(error) {
                        console.log(error);
                        this.errorOntologies = true;
                    }
                }

                // preselect the ontology of the project
                this.selectedOntology = this.project.ontology;
                this.savingOntology = false;
            }
        }
    },
    methods: {
        async rename() {
            let updatedProject = this.project.clone();
            try {
                updatedProject.name = this.newName;
                await updatedProject.save();
                this.$emit("update", updatedProject);
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-project-rename", {projectName: updatedProject.name})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-project-rename", {projectName: this.project.name})
                });
            }
            this.isRenameModalActive = false;
        },

        async saveOntology(forceOntologyUpdate=false) {
            this.savingOntology = true; // possibly long operation => give user visual indication that it is in progress
            let updatedProject = this.project.clone();
            try {
                updatedProject.ontology = this.selectedOntology;
                updatedProject.forceOntologyUpdate = forceOntologyUpdate; // to delete annotationterms if some exist
                await updatedProject.save();
                this.$emit("update", updatedProject);
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-project-ontology-change", {projectName: this.project.name})
                });
            }
            catch(error) {
                console.log(error);
                if(error.response && error.response.data.errorValues) {
                    let counts = error.response.data.errorValues;

                    // if the only terms associations are performed by users, ask confirmation and delete them
                    if(counts.algoAssociatedTermsCount === 0 && counts.reviewedAssociatedTermsCount === 0) {
                        this.$dialog.confirm({
                            title: this.$t("confirm-ontology-change"),
                            message: this.$t("confirm-ontology-change-delete-user-terms", {count: counts.userAssociatedTermsCount}),
                            type: "is-danger",
                            confirmText: this.$t("button-confirm"),
                            cancelText: this.$t("button-cancel"),
                            onConfirm: () => this.saveOntology(true)
                        });
                    }
                    else { // otherwise, backend does not allow automatic deletion => notify of error
                        this.cannotDeleteOntology = true;
                        this.$notify({
                            type: "error",
                            text: this.$t("notif-error-project-ontology-change-" +
                                (counts.algoAssociatedTermsCount ? "job-terms" : "reviewed-terms"))
                        });
                    }
                }
                else {
                    this.$notify({
                        type: "error",
                        text: this.$t("notif-error-project-ontology-change", {projectName: this.project.name})
                    });
                }
            }
            this.savingOntology = false;
            this.isOntologyModalActive = false;
        },

        deleteProject() {
            this.$dialog.confirm({
                title: this.$t("delete-project"),
                message: this.$t("delete-project-confirmation-message", {projectName: this.project.name}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.$emit("delete")
            });
        }
    }
};
</script>