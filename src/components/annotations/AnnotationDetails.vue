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

            <template v-if="annotation.area > 0"> <!-- Do not display perimeter and area for point annotations -->
                <tr>
                    <td><strong>{{$t("area")}}</strong></td>
                    <td>{{ `${annotation.area.toFixed(3)} ${annotation.areaUnit}` }}</td>
                </tr>
                <tr>
                    <td><strong>{{$t("perimeter")}}</strong></td>
                    <td>{{ `${annotation.perimeter.toFixed(3)} ${annotation.perimeterUnit}` }}</td>
                </tr>
            </template>

            <tr>
                <td colspan="2">
                    <h5>{{$t("description")}}</h5>
                    <cytomine-description :object="annotation"></cytomine-description>
                </td>
            </tr>

            <!-- TERMS -->
            <tr>
                <td colspan="2">
                    <h5>{{$t("terms")}}</h5>
                    <b-tag v-for="{term, user} in associatedTerms" :key="term.id"
                    :title="`${$t('associated-by')} ${user.fullName}`">
                        <cytomine-term :term="term"></cytomine-term>
                        <button class="delete is-small" :title="$t('button-delete')" @click="removeTerm(term)"></button>
                    </b-tag>
                    <b-field>
                        <b-autocomplete
                            v-model="addTermString"
                            :placeholder="$t('add-term')"
                            :open-on-focus="true"
                            :data="filteredTerms"
                            field="name"
                            size="is-small"
                            @select="addTerm">
                            <div slot-scope="{option: term}" class="autocomplete-term-option">
                                <cytomine-term :term="term"></cytomine-term>
                            </div>
                            <div slot="empty" class="autocomplete-term-option">
                                {{$t("no-term-to-add")}}
                            </div>
                        </b-autocomplete>
                    </b-field>
                </td>
            </tr>

            <!-- PROPERTIES -->
            <tr>
                <td colspan="2">
                    <h5>{{$t("properties")}}</h5>
                    <cytomine-properties :object="annotation" @update="$emit('updateProperties')">
                    </cytomine-properties>
                </td>
            </tr>

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
            <a :href="annotation.url" class="level-item button is-small"> {{ $t("button-view-crop") }} </a>
            <button class="level-item button is-small" @click="copyURL()"> {{ $t("button-copy-url") }} </button>
            <button class="level-item button is-small"> {{ $t("button-comment") }} </button> <!-- TODO -->
            <button class="level-item button is-small is-danger" @click="confirmDeletion()">
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
import CytomineTerm from "@/components/term/CytomineTerm";

export default {
    name: "annotations-details",
    components: {
        CytomineDescription,
        CytomineTerm,
        CytomineProperties
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
        };
    },
    computed: {
        creator() {
            return this.users.find(user => user.id == this.annotation.user) || {};
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
        filteredTerms() {
            return this.terms.filter(({id, name}) => {
                return !this.annotation.term.includes(id) && 
                    name.toLowerCase().indexOf(this.addTermString.toLowerCase()) >= 0;
            });
        }
    },
    methods: {
        copyURL() {
            copyToClipboard(window.location.origin + "/#" + this.annotationURL);
            this.$notify({type: "success", text: this.$t("notif-success-annot-URL-copied")});
        },

        async addTerm(term) {
            if(term != null) {
                try {
                    // TODO: fix issue with AlgoAnnotation https://github.com/cytomine/Cytomine-core/issues/1139
                    await new AnnotationTerm({annotation: this.annotation.id, term: term.id}).save(); 
                    this.$emit("updateTerms");
                }
                catch(error) {
                    this.$notify({type: "error", text: this.$t("notif-error-add-term")});
                }
                finally {
                    this.addTermString = "";
                }
            }
        },
        async removeTerm(term) {
            try {
                // TODO decide who can delete what, and adapt accordingly
                // TODO fix issue with AlgoAnnotationTerm: https://github.com/cytomine/Cytomine-core/issues/1138
                await AnnotationTerm.delete(this.annotation.id, term.id);
                this.$emit("updateTerms");
            }
            catch(error) {
                this.$notify({type: "error", text: this.$t("notif-error-remove-term")});
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
</style>

<style>
.annotation-details .tag {
    margin-right: 5px;
    margin-bottom: 5px !important;
    background-color: rgba(0, 0, 0, 0.04);
}
</style>
