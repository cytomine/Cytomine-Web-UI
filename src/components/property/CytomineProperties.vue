<template>
<div class="properties-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">    
        <b-field grouped group-multiline>
            <div class="control" v-for="(prop, idx) in notEditedProperties" :key="prop.id">
                <b-taglist attached>
                    <b-tag type="is-dark">{{prop.key}}</b-tag>
                    <b-tag>
                        {{prop.value}}
                        <template v-if="canEdit">
                            <button class="edit is-small" :title="$t('button-edit')" @click="startPropEdition(prop)">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="delete is-small" :title="$t('button-delete')" @click="removeProp(idx)">
                            </button>
                        </template>
                    </b-tag>
                </b-taglist>
            </div>

            <button v-if="canEdit" class="button is-small add-prop" @click="addNewProp()" key="showForm">
                {{$t("button-add")}}
            </button>
            <em v-else-if="properties.length == 0">{{$t("no-properties")}}</em>
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
    </template>
</div>
</template>

<script>
import {Property, PropertyCollection} from "cytomine-client";

export default {
    name: "cytomine-properties",
    props: {
        object: {type: Object},
        canEdit: {type: Boolean, default: true}
    },
    data() {
        return {
            loading: true,

            properties: [],
            editedProperties: [],
            newPropKey: "",
            newPropValue: "",
            showNewPropForm: false
        };
    },
    computed: {
        notEditedProperties() {
            let editedIds = this.editedProperties.map(prop => prop.id);
            return this.properties.filter(prop => !editedIds.includes(prop.id));
        }
    },
    methods: {
        addNewProp() {
            let newProp = new Property({object: this.object});
            this.editedProperties.push(newProp);
        },
        async removeProp(idx) {
            let prop = this.properties[idx];
            try {
                await Property.delete(prop.id, this.object);
                this.properties.splice(idx, 1);
                this.$emit("update");
            }
            catch(error) {
                console.log(error);
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
                this.$emit("update");
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-save-prop")});
            }
        },
        cancelPropEdition(idx) {
            let prop = this.editedProperties[idx];
            prop.key = prop.oldKey;
            prop.value = prop.oldValue;
            this.editedProperties.splice(idx, 1);
        },
    },
    async created() {
        this.properties = (await PropertyCollection.fetchAll({object: this.object})).array;
        this.loading = false;
    }
};
</script>

<style>
.add-prop {
    height: 24px;
}

.new-prop-form {
    margin-bottom: 5px;
    margin-top: 5px;
}

.new-prop-form .button {
    margin: 0px;
    margin-right: 5px;
}

.new-prop-form .control {
    margin-right: 10px;
    display: inline-block;
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
    font-size: 8px;
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
</style>

<style>
.properties-wrapper .control {
    margin-bottom: 0px !important;
}

.properties-wrapper .tags {
    margin-bottom: unset !important;
}

.properties-wrapper .tag {
    margin-right: 5px;
    margin-bottom: 5px !important;
    background-color: rgba(0, 0, 0, 0.04);
}

.properties-wrapper .tag.is-dark {
    background-color: rgba(0, 0, 0, 0.1);
    color: black;
}

.properties-wrapper .field.is-grouped.is-grouped-multiline {
    margin-bottom: 0px !important;
}
</style>