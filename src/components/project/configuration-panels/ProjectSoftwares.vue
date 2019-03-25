<template>
<div class="project-softwares-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
        <h2> {{ $t("error") }} </h2>
        <p> {{ $t("unexpected-error-info-message") }} </p>
    </b-message>
    <template v-else-if="!loading">
        <b-input class="search-field" v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search">
        </b-input>

        <b-table :data="filteredSoftwares"
                default-sort="selected"
                default-sort-direction="desc"
                :paginated="true"
                :per-page="perPage"
                pagination-size="is-small">

            <template #default="{row: software}">
                <b-table-column field="name" :label="$t('name')" sortable width="100">
                    {{software.name}}
                </b-table-column>

                <b-table-column :label="$t('description')" width="400">
                    <template v-if="software.description">{{software.description}}</template>
                    <em v-else>{{$t("no-description")}}</em>
                </b-table-column>

                <b-table-column field="selected" :label="$t('status')" sortable width="100">
                    <button :class="['button', software.selected ? 'is-success' : 'is-danger']"
                            @click="toggleSoftware(software)">
                        {{$t(software.selected ? "enabled" : "disabled")}}
                    </button>
                </b-table-column>
            </template>

            <template #empty>
                <div class="content has-text-grey has-text-centered">
                    <p>{{$t("no-algorithm")}}</p>
                </div>
            </template>

            <template #bottom-left>
                <b-select v-model="perPage" size="is-small">
                    <option value="10">10 {{$t("per-page")}}</option>
                    <option value="25">25 {{$t("per-page")}}</option>
                    <option value="50">50 {{$t("per-page")}}</option>
                    <option value="100">100 {{$t("per-page")}}</option>
                </b-select>
            </template>
        </b-table>
    </template>
</div>
</template>

<script>
import {SoftwareCollection, SoftwareProject, SoftwareProjectCollection} from "cytomine-client";

export default {
    name: "project-softwares",
    data() {
        return {
            loading: true,
            error: false,

            searchString: "",
            perPage: 10,

            softwares: []
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },

        filteredSoftwares() {
            let str = this.searchString.toLowerCase();
            return this.softwares.filter(software => software.name.toLowerCase().indexOf(str) >= 0);
        }
    },
    methods: {
        async toggleSoftware(software) {
            try {
                if(software.selected) {
                    await software.softwareProject.delete();
                    software.selected = false;
                }
                else {
                    let softwareProject = await new SoftwareProject({
                        software: software.id, 
                        project: this.project.id
                    }).save();
                    software.softwareProject = softwareProject;
                    software.selected = true;
                }
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-change-status-algorithm-project", {softwareName: software.name})
                });
            }
        }
    },
    async created() {
        try {
            let promiseSoftwares = SoftwareCollection.fetchAll();
            let promiseSoftwareProjects = SoftwareProjectCollection.fetchAll({
                filterKey: "project",
                filterValue: this.project.id
            });

            let softwares = (await promiseSoftwares).array;
            let softwareProjects = (await promiseSoftwareProjects).array;

            softwares.forEach(software => {
                software.softwareProject = softwareProjects.find(sp => sp.software == software.id);
                software.selected = software.softwareProject != null;
            });

            this.softwares = softwares;
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }
        this.loading = false;
    }
};
</script>

<style scoped>
.project-softwares-wrapper {
    min-height: 200px;
}
</style>

<style>
.project-softwares-wrapper .search-field {
    max-width: 300px;
}

.project-softwares-wrapper .table {
    margin-top: 20px;
}

.project-softwares-wrapper .table .button {
    padding: 0px 40px;
}
</style>