<template>
<div class="annotation-details">
    <table class="table">
        <tbody>
            <tr v-if="showImageInfo">
                <td><strong>{{$t("image")}}</strong></td>
                <td>
                    <router-link :to="`/project/${annotation.project}/image/${annotation.image}`">
                        {{ image.instanceFilename }}
                    </router-link>
                </td>
            </tr>

            <template v-if="isPropDisplayed('geometry-info')">
                <tr v-if="annotation.area > 0">
                    <td><strong>{{$t("area")}}</strong></td>
                    <td>{{ `${annotation.area.toFixed(3)} ${annotation.areaUnit}` }}</td>
                </tr>

                <tr v-if="annotation.perimeter > 0">
                    <td><strong>{{$t(annotation.area > 0 ? "perimeter" : "length")}}</strong></td>
                    <td>{{ `${annotation.perimeter.toFixed(3)} ${annotation.perimeterUnit}` }}</td>
                </tr>
            </template>

            <tr v-if="isPropDisplayed('description')">
                <td colspan="2">
                    <h5>{{$t("description")}}</h5>
                    <cytomine-description :object="annotation" :canEdit="canEdit" />
                </td>
            </tr>

            <!-- TERMS -->
            <tr v-if="isPropDisplayed('terms')">
                <td colspan="2">
                    <h5>{{$t("terms")}}</h5>
                    <b-tag v-for="{term, user} in associatedTerms" :key="term.id"
                    :title="`${$t('associated-by')} ${user.fullName}`">
                        <cytomine-term :term="term"></cytomine-term>
                        <button v-if="canEdit" class="delete is-small" :title="$t('button-delete')"
                            @click="removeTerm(term.id)">
                        </button>
                    </b-tag>
                    <div class="add-term-wrapper" v-if="canEdit" v-click-outside="() => showTermSelector = false">
                        <b-field>
                            <b-input size="is-small"
                                    expanded
                                    :placeholder="$t('add-term')"
                                    v-model="addTermString"
                                    @focus="showTermSelector = true" />
                        </b-field>

                        <div class="ontology-tree-container" v-show="showTermSelector">
                            <ontology-tree class="ontology-tree"
                                :ontology="ontology"
                                :searchString="addTermString"
                                :selectedNodes="associatedTermsIds"
                                @select="addTerm"
                                @unselect="removeTerm" />
                        </div>
                    </div>
                    <em v-else-if="associatedTerms.length == 0">{{$t("no-term")}}</em>
                </td>
            </tr>

            <!-- PROPERTIES -->
            <tr v-if="isPropDisplayed('properties')">
                <td colspan="2">
                    <h5>{{$t("properties")}}</h5>
                    <cytomine-properties :object="annotation" :canEdit="canEdit" @update="$emit('updateProperties')" />
                </td>
            </tr>

            <tr v-if="isPropDisplayed('attached-files')">
                <td colspan="2">
                    <h5>{{$t("attached-files")}}</h5>
                    <attached-files :object="annotation" :canEdit="canEdit" />
                </td>
            </tr>

            <template v-if="isPropDisplayed('creation-info')">
                <tr>
                    <td><strong>{{$t("created-by")}}</strong></td>
                    <td>
                        {{ creator.fullName }}
                    </td>
                </tr>
                <tr>
                    <td><strong>{{$t("created-on")}}</strong></td>
                    <td> {{ Number(annotation.created) | moment("ll") }} </td>
                </tr>
            </template>
        </tbody>
    </table>

    <div class="actions">
        <router-link
            v-if="showImageInfo"
            :to="annotationURL"
            class="button is-link is-small is-fullwidth">
            {{ $t("button-view-in-image") }}
        </router-link>

        <a v-else class="button is-link is-small is-fullwidth" @click="$emit('centerView')">
            {{ $t("button-center-view-on-annot") }}
        </a>

        <div class="level">
            <a :href="annotation.url" class="level-item button is-small">
                {{ $t("button-view-crop") }}
            </a>

            <button class="level-item button is-small" @click="copyURL()">
                {{ $t("button-copy-url") }}
            </button>

            <button v-if="isPropDisplayed('comments')" class="level-item button is-small"> <!-- TODO -->
                {{ $t("button-comment") }}
            </button>

            <button v-if="canEdit" class="level-item button is-small is-danger" @click="confirmDeletion()">
                {{ $t("button-delete") }}
            </button>
        </div>
    </div>
</div>
</template>

<script>
import {AnnotationTerm} from "cytomine-client";
import copyToClipboard from "copy-to-clipboard";
import CytomineDescription from "@/components/description/CytomineDescription";
import CytomineProperties from "@/components/property/CytomineProperties";
import CytomineTerm from "@/components/ontology/CytomineTerm";
import AttachedFiles from "@/components/attached-file/AttachedFiles";
import OntologyTree from "@/components/ontology/OntologyTree";

export default {
    name: "annotations-details",
    components: {
        CytomineDescription,
        CytomineTerm,
        OntologyTree,
        CytomineProperties,
        AttachedFiles
    },
    props: {
        annotation: {type: Object},
        terms: {type: Array},
        users: {type: Array},
        images: {type: Array},
        showImageInfo: {type: Boolean, default: true}
    },
    data() {
        return {
            addTermString: "",
            showTermSelector: false,
            revTerms: 0
        };
    },
    computed: {
        configUI() {
            return this.$store.state.project.configUI;
        },
        ontology() {
            return this.$store.state.project.ontology;
        },
        creator() {
            return this.users.find(user => user.id == this.annotation.user) || {};
        },
        canEdit() {
            return this.$store.getters.canEditLayer(this.annotation.user);
        },
        image() {
            return this.images.find(image => image.id == this.annotation.image) || {};
        },
        annotationURL() {
            return `/project/${this.annotation.project}/image/${this.annotation.image}/annotation/${this.annotation.id}`;
        },
        associatedTerms() {
            if(this.annotation.userByTerm != null) {
                return this.annotation.userByTerm.map(ubt => {
                    let term = this.terms.find(term => ubt.term == term.id);
                    let user = this.users.find(user => user.id == ubt.user[0]) || {}; // QUESTION: can we have several users?
                    return {term, user};
                });
            }
            else {
                return [];
            }
        },
        associatedTermsIds() {
            this.revTerms;
            return this.associatedTerms.map(({term}) => term.id);
        }
    },
    methods: {
        isPropDisplayed(prop) {
            let displayed = this.configUI[`project-explore-annotation-${prop}`];
            return (displayed || displayed == null); // TODO: replace with return displayed once all props are managed in backend
        },

        copyURL() {
            copyToClipboard(window.location.origin + "/#" + this.annotationURL);
            this.$notify({type: "success", text: this.$t("notif-success-annot-URL-copied")});
        },

        async addTerm(idTerm) {
            if(idTerm != null) {
                try {
                    // TODO: fix issue with AlgoAnnotation https://github.com/cytomine/Cytomine-core/issues/1139
                    await new AnnotationTerm({annotation: this.annotation.id, term: idTerm}).save();
                    this.$emit("updateTerms");
                    this.showTermSelector = false;
                }
                catch(error) {
                    this.$notify({type: "error", text: this.$t("notif-error-add-term")});
                    this.revTerms++;
                }
                finally {
                    this.addTermString = "";
                }
            }
        },
        async removeTerm(idTerm) {
            try {
                // TODO decide who can delete what, and adapt accordingly
                // TODO fix issue with AlgoAnnotationTerm: https://github.com/cytomine/Cytomine-core/issues/1138
                await AnnotationTerm.delete(this.annotation.id, idTerm);
                this.$emit("updateTerms");
            }
            catch(error) {
                this.$notify({type: "error", text: this.$t("notif-error-remove-term")});
                this.revTerms++;
            }
        },

        confirmDeletion() {
            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-annotation"),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteAnnot()
            });
        },

        async deleteAnnot() {
            try {
                await this.annotation.delete();
                this.$emit("deletion");
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-annotation-deletion")});
            }
        },
    }
};
</script>

<style scoped>
.annotation-details {
    position: relative;
}

.table {
    width: 100%;
    margin-bottom: 10px !important;
    background: unset;
}
.table th, .table td {
    vertical-align: middle;
}

h5 {
    font-weight: 600;
    margin-bottom: 8px;
}

.actions {
    margin-bottom: 5px;
}

.annotation-details .actions .button {
    margin: 3px;
    box-sizing: border-box;
}

.annotation-details button.is-fullwidth {
    width: unset;
}

.autocomplete-term-option {
    font-size: 13px;
}

.add-term-wrapper {
    position: relative;
}

.ontology-tree-container {
    position: absolute;
    top: 100%;
    left: 0px;
    z-index: 500;
    padding-top: 5px;
    background: white;
    width: 100%;
    max-height: 30vh;
    overflow: auto;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    border-radius: 4px;
    margin-top: 4px;
}
</style>

<style>
.annotation-details .tag {
    margin-right: 5px;
    margin-bottom: 5px !important;
    background-color: rgba(0, 0, 0, 0.04);
}
</style>
