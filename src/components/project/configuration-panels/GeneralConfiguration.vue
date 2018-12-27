<template>
<div class="project-general-configuration">
    <h2>{{$t("editing-mode")}}</h2>
    <p class="explanation">{{$t("editing-mode-explanation")}}</p>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="radio" value="CLASSIC" v-model="editingMode">
                {{$t("classic")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("classic-mode-explanation")}}
            </b-message>
        </div>
    </div>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="radio" value="RESTRICTED" v-model="editingMode">
                {{$t("restricted")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("restricted-mode-explanation")}}
            </b-message>
        </div>
    </div>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="radio" value="READ-ONLY" v-model="editingMode">
                {{$t("read-only")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("read-only-mode-explanation")}}
            </b-message>
        </div>
    </div>

    <h2>{{$t("blind-mode")}}</h2>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="checkbox" v-model="blindMode">
                {{$t("blind-mode")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("blind-mode-explanation")}}
            </b-message>
        </div>
    </div>

    <h2>{{$t("annotation-layers")}}</h2>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="checkbox" v-model="hideManagersLayers">
                {{$t("hide-managers-layers")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("hide-managers-layers-explanation")}}
            </b-message>
        </div>
    </div>

    <div class="columns">
        <div class="column is-one-quarter">
            <label>
                <input type="checkbox" v-model="hideContributorsLayers">
                {{$t("hide-contributors-layers")}}
            </label> 
        </div>
        <div class="column">
            <b-message type="is-info" has-icon size="is-small">
                {{$t("hide-contributors-layers-explanation")}}
            </b-message>
        </div>
    </div>

    <h2>{{$t("default-annotation-layers")}}</h2>

    <b-field grouped>
        <b-select size="is-small" :placeholder="$t('select-layer-placeholder')" v-model="layerToAdd">
            <option v-for="layer in unselectedLayers" :key="layer.id" :value="layer">
                {{layer.fullName}}
            </option>
        </b-select>

        <button class="button is-small" :disabled="layerToAdd == null" @click="addDefaultLayer()">
            {{$t("button-add")}}
        </button>
    </b-field>

    <table v-if="selectedLayers.length > 0" class="table">
        <tbody>
            <tr>
                <th>{{$t("layer")}}</th>
                <th>{{$t("hide-by-default")}}</th>
                <th></th>
            </tr>
            <tr v-for="(layer, idx) in selectedLayers" :key="layer.id">
                <td>{{layer.fullName}}</td>
                <td class="is-centered">
                    <input type="checkbox" v-model="defaultLayers[idx].hideByDefault" @change="saveDefaultLayer(idx)">
                </td>
                <td>
                    <button class="button is-small" @click="deleteDefaultLayer(idx)"> {{$t("button-remove")}}</button>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- TODO in core -->
    <h2>{{$t("default-property")}}</h2>
    <b-field>
        <b-select size="is-small">
            <option :value="null">{{$t("no-default-property")}}</option>
        </b-select>
    </b-field>

    <h2>Actions</h2>
    <project-actions :project="project" size="is-normal" @delete="deleteProject()"></project-actions>
</div>    
</template>

<script>
import ProjectActions from "../ProjectActions";
import {Project, ProjectDefaultLayer, ProjectDefaultLayerCollection} from "cytomine-client";
import {fullName} from "@/utils/user-utils.js";

export default {
    name: "general-configuration",
    components: {ProjectActions},
    data() {
        return {
            editingMode: "",
            blindMode: null,
            hideManagersLayers: null,
            hideContributorsLayers: null,

            layers: [], // TODO: ensure correct refresh of layers list when user adds users to the project
            layerToAdd: null,
            defaultLayers: []
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        currentEditingMode() {
            return this.project.isReadOnly ? "READ-ONLY" : this.project.isRestricted ? "RESTRICTED" : "CLASSIC";
        },

        selectedLayers() {
            return this.defaultLayers.map(defaultLayer => {
                let layer = this.layers.find(layer => layer.id == defaultLayer.user);
                return {...defaultLayer, ...layer};
            });
        },
        unselectedLayers() {
            let selectedLayersIds = this.defaultLayers.map(layer => layer.user);
            return this.layers.filter(layer => !selectedLayersIds.includes(layer.id));
        }
    },
    watch: {
        editingMode(mode) {
            if(mode == this.currentEditingMode) {
                return;
            }
            this.updateProject({isReadOnly: mode == "READ-ONLY", isRestricted: mode == "RESTRICTED"});
        },

        blindMode() {
            if(this.blindMode == this.project.blindMode) {
                return;
            }
            this.updateProject({blindMode: this.blindMode});
        },

        hideManagersLayers() {
            if(this.hideManagersLayers == this.project.hideAdminsLayers) {
                return;
            }
            this.updateProject({hideAdminsLayers: this.hideManagersLayers});
        },

        hideContributorsLayers() {
            if(this.hideContributorsLayers == this.project.hideUsersLayers) {
                return;
            }
            this.updateProject({hideUsersLayers: this.hideContributorsLayers});
        }
    },
    methods: {
        initData() {
            this.editingMode = this.currentEditingMode;
            this.blindMode = this.project.blindMode;
            this.hideManagersLayers = this.project.hideAdminsLayers;
            this.hideContributorsLayers = this.project.hideUsersLayers;
        },

        async fetchLayers() {
            let layers = (await this.project.fetchUserLayers()).array;
            layers.forEach(layer => layer.fullName = fullName(layer));
            this.layers = layers;
        },

        async fetchDefaultLayers() {
            this.defaultLayers = (await ProjectDefaultLayerCollection.fetchAll({
                filterKey: "project", 
                filterValue: this.project.id
            })).array;
        },

        async updateProject(newProps) {
            let updatedProject = this.project.clone();
            updatedProject.populate(newProps);
            try {
                await updatedProject.save();
                this.$store.commit("setProject", updatedProject);
            }
            catch(error) {
                console.log(error);
                this.initData(); // reset data
                this.$notify({type: "error", text: this.$t("notif-error-general-config-update")});
            }
        },

        async addDefaultLayer() {
            if(this.layerToAdd == null) {
                return;
            }

            try {
                let defaultLayer = new ProjectDefaultLayer({
                    project: this.project.id,
                    user: this.layerToAdd.id
                });
                await defaultLayer.save();
                this.defaultLayers.push(defaultLayer);
                this.layerToAdd = null;
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-default-layer-add")});
            }
        },

        async saveDefaultLayer(idx) {
            try {
                await this.defaultLayers[idx].save();
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-default-layer-update")});
            }
        },

        async deleteDefaultLayer(idx) {
            try {
                await this.defaultLayers[idx].delete();
                this.defaultLayers.splice(idx, 1);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-default-layer-delete")});
            }
        },

        async deleteProject() {
            try {
                await Project.delete(this.project.id);
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-project-deletion", {projectName: this.project.name})
                });
                this.$router.push("/projects");
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-project-deletion", {projectName: this.project.name})
                });
            }
        }
    },
    created() {
        this.initData();
        this.fetchLayers();
        this.fetchDefaultLayers();
    }
};
</script>

<style scoped>
h2 {
    color: #444;
    border-bottom: 1px solid #ddd;
    margin-top: 20px;
}

h2:first-child {
    margin-top: 0px;
}

.columns {
    align-items: center;
}

.column {
    padding: 10px;
}

.column:first-child {
    padding-left: 50px;
}

.explanation {
    margin-bottom: 20px;
}

.is-centered {
    text-align: center;
}

th, td {
    padding: 0.5em 25px !important;
}
</style>

<style>
.project-general-configuration .message-body {
    padding: 10px !important;
}

.project-general-configuration select {
    width: 300px;
}
</style>