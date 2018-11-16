<template>
<div class="annotation-details">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading">
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
                <tr>
                    <td><strong>{{$t("description")}}</strong></td>
                    <td>
                        <cytomine-description :object="annotation"></cytomine-description>
                    </td>
                </tr>

                <!-- TERMS -->
                <tr>
                    <td><strong>{{$t("terms")}}</strong></td>
                    <td>
                        <b-tag v-for="{term, user} in associatedTerms" :key="term.id"
                        :title="`${$t('associated-by')} ${user.fullName}`">
                            <div class="color-preview" :style="{background: term.color}"></div>
                            {{term.name}}
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
                                    <div class="color-preview" :style="{background: term.color}"></div>
                                    {{term.name}}
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
                    <td><strong>{{$t("properties")}}</strong></td>
                    <td>
                        <b-field grouped group-multiline>
                            <div class="control" v-for="(prop, idx) in notEditedProperties" :key="prop.id">
                                <b-taglist attached>
                                    <b-tag type="is-dark">{{prop.key}}</b-tag>
                                    <b-tag>
                                        {{prop.value}}
                                        <button class="edit is-small" :title="$t('button-edit')" 
                                        @click="startPropEdition(prop)">
                                            <b-icon size="is-small" icon="pencil"></b-icon>
                                        </button>
                                        <button class="delete is-small" :title="$t('button-delete')" 
                                        @click="removeProp(idx)">
                                        </button>
                                    </b-tag>
                                </b-taglist>
                            </div>

                            <button class="button is-small add-prop" @click="addNewProp()" key="showForm">
                                {{$t("button-add")}}
                            </button>
                        </b-field>

                        <form class="new-prop-form" v-for="(prop, idx) in editedProperties" :key="prop.id">
                            <b-input size="is-small" v-model="prop.key" :placeholder="$t('key')"></b-input>
                            <b-input size="is-small" v-model="prop.value" :placeholder="$t('value')"></b-input>
                            <button class="button is-small" type="submit" @click="saveProp(idx)">
                                {{prop.id ? $t("button-save") : $t("button-add")}}
                            </button>
                            <button class="button is-small" @click="cancelPropEdition(idx)">
                                {{$t("button-cancel")}}
                            </button>
                        </form>
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
            </tbody>
        </table>
        <div class="actions">
            <router-link 
                v-if="showImageInfo"
                :to="annotationURL"
                class="button is-link is-small is-fullwidth">
                {{ $t("button-view-in-image") }}
            </router-link>
            <div class="level">
                <a :href="annotation.url" class="level-item button is-small"> {{ $t("button-view-crop") }} </a>
                <button class="level-item button is-small" @click="copyURL()"> {{ $t("button-copy-url") }} </button>
                <button class="level-item button is-small"> {{ $t("button-comment") }} </button> <!-- TODO -->
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {Property, PropertyCollection, AnnotationTerm} from "cytomine-client";
import copyToClipboard from "copy-to-clipboard";
import CytomineDescription from "@/components/utils/CytomineDescription";

export default {
    name: "annotations-details",
    components: {CytomineDescription},
    props: {
        annotation: {type: Object},
        terms: {type: Array},
        users: {type: Array},
        images: {type: Array},
        showImageInfo: {type: Boolean, default: true}
    },
    data() {
        return {
            loading: true,

            addTermString: "",

            properties: [],
            editedProperties: [],
            newPropKey: "",
            newPropValue: "",
            showNewPropForm: false
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
            return this.annotation.userByTerm.map(ubt => {
                let term = this.terms.find(term => ubt.term == term.id);
                let user = this.users.find(user => user.id == ubt.user[0]) || {}; // QUESTION: can we have several users? 
                return {term, user};
            });
        },
        filteredTerms() {
            return this.terms.filter(({id, name}) => {
                return !this.annotation.term.includes(id) && 
                    name.toLowerCase().indexOf(this.addTermString.toLowerCase()) >= 0;
            });
        },
        notEditedProperties() {
            let editedIds = this.editedProperties.map(prop => prop.id);
            return this.properties.filter(prop => !editedIds.includes(prop.id));
        }
    },
    methods: {
        copyURL() {
            copyToClipboard(window.location.origin + "/#" + this.annotationURL);
        },

        async addTerm(term) {
            if(term != null) {
                try {
                    // TODO: fix issue with AlgoAnnotation https://github.com/cytomine/Cytomine-core/issues/1139
                    await new AnnotationTerm({annotation: this.annotation.id, term: term.id}).save(); 
                    this.$emit("update");
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
                this.$emit("update");
            }
            catch(error) {
                this.$notify({type: "error", text: this.$t("notif-error-remove-term")});
            }
        },

        addNewProp() {
            let newProp = new Property({object: this.annotation});
            this.editedProperties.push(newProp);
        },
        async removeProp(idx) {
            let prop = this.properties[idx];
            try {
                await Property.delete(prop.id, this.annotation);
                this.properties.splice(idx, 1);
            }
            catch(error) {
                this.$notify({type: "error", text: this.$t("notif-error-remove-prop")});
            }
        },
        startPropEdition(prop) {
            // store current values of key and value, so that they can be restored if needed (e.g. edit cancellation)
            prop.oldKey = prop.key;
            prop.oldValue = prop.value;
            this.editedProperties.splice(0, 0, prop); // insert at first position
        },
        async saveProp(idx) {
            let prop = this.editedProperties[idx];
            let newProp = prop.isNew();
            try {
                await prop.save();
                this.editedProperties.splice(idx, 1);
                if(newProp) {
                    this.properties.push(prop);
                }
            }
            catch(error) {
                this.$notify({type: "error", text: this.$t("notif-error-save-prop")});
            }
        },
        cancelPropEdition(idx) {
            let prop = this.editedProperties[idx];
            prop.key = prop.oldKey;
            prop.value = prop.oldValue;
            this.editedProperties.splice(idx, 1);
        }
    },
    async created() {
        this.properties = (await PropertyCollection.fetchAll({object: this.annotation})).array;
        this.loading = false;
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

.actions {
    margin-bottom: 5px;
}

.annotation-details .actions .button {
    margin: 3px;
    box-sizing: border-box;
}
.color-preview {
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 3px;
    border-radius: 3px;
    box-shadow: 0px 0px 1px #777;
    position: relative;
    top: 2px;
}

.annotation-details button.is-fullwidth {
    width: unset;
}

.autocomplete-term-option {
    font-size: 13px;
}

.tag button.edit, .tag button.delete {
    position: relative;
    top: 1px;
}

.tag button.edit {
    height: 16px;
    width: 16px;
    background-color: rgba(10, 10, 10, 0.2);
    border: none;
    border-radius: 290486px;
    cursor: pointer;
    pointer-events: auto;
    display: inline-block;
    font-size: 9px;
    padding: 0px;
    outline: none;
    position: relative;
    vertical-align: top;
    color: white;
    margin-left: 5px;
}

.tag button.edit:hover {
    background-color: rgba(10, 10, 10, 0.3);
}

.add-prop {
    height: 24px;
}

.new-prop-form {
    margin-bottom: 5px;
}

.new-prop-form .button {
    margin: 0px;
    margin-right: 5px;
}

.new-prop-form .control {
    margin-right: 10px;
    display: inline-block;
}

</style>

<style>
.annotation-details .control {
    margin-bottom: 0px !important;
}

.annotation-details .tags {
    margin-bottom: unset !important;
}

.annotation-details .tag {
    margin-right: 5px;
    margin-bottom: 5px !important;
    background-color: rgba(0, 0, 0, 0.04);
}

.annotation-details .tag.is-dark {
    background-color: rgba(0, 0, 0, 0.1);
    color: black;
}

.annotation-details .field.is-grouped.is-grouped-multiline {
    margin-bottom: 0px !important;
}
</style>
