<template>
<div class="list-projects-wrapper">
    <div class="panel">
        <p class="panel-heading"></p>
        <div class="panel-block">
            <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search"></b-input>

            <b-table :data="filteredProjects" class="table-projects" :paginated="true" :per-page="10" pagination-size="is-small" detailed detail-key="id">
                <template slot-scope="props">
                    <b-table-column field="name" :label="$t('name')" sortable>
                        {{ props.row.name }}
                    </b-table-column>

                    <b-table-column field="first_name" label="Users" centered sortable>
                        0 <!-- TODO in backend -->
                    </b-table-column>

                    <b-table-column field="numberOfImages" :label="$t('images')" centered sortable>
                        <router-link to="images">{{ props.row.numberOfImages }}</router-link>
                    </b-table-column>

                    <b-table-column field="numberOfAnnotations" :label="$t('annotations')" centered sortable>
                        {{ props.row.numberOfAnnotations }}
                    </b-table-column>

                    <b-table-column field="numberOfJobAnnotations" :label="$t('job-annotations')" centered sortable>
                        {{ props.row.numberOfJobAnnotations }}
                    </b-table-column>

                    <b-table-column field="isManaged" :label="$t('role')" centered sortable>
                        <span :class="['tag', 'is-rounded', props.row.isManaged ? 'manager' : 'contributor']">
                            {{$t(props.row.isManaged ? "manager" : 'contributor')}}
                        </span>
                    </b-table-column>

                    <b-table-column label="" centered>
                        <router-link to="/project/" class="button is-small">{{$t("button-open")}}</router-link>
                    </b-table-column>
                </template>

                <template slot="detail" slot-scope="props">
                    <project-details :project="props.row"></project-details>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-projects")}}</p>
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";

import ProjectDetails from "./ProjectDetails";

import {ProjectCollection} from "cytomine-client";

export default {
    name: "list-projects",
    components: {ProjectDetails},
    data() {
        return {
            projects: [],
            searchString: ""
        };
    },
    computed: {
        filteredProjects() {
            let str = this.searchString.toLowerCase();
            return this.projects.filter(project => {
                return project.name.toLowerCase().indexOf(str) >= 0;
            });
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    async created() {
        let managedProjectsPromise = new ProjectCollection({light: true, admin: true}, 0, "user", this.currentUser.id).fetch();

        let projects = await ProjectCollection.fetch();
        let managedProjects = await managedProjectsPromise;
        let idManagedProjects = managedProjects.array.map(project => project.id);

        this.projects = projects.array.map(project => {
            project.isManaged = idManagedProjects.includes(project.id);
            return project;
        });
    }
};
</script>

<style scoped>
.list-projects-wrapper {
    padding: 30px 50px 30px 50px;
}

.tag.manager, .tag.contributor {
    width: 100px;
    color: white;
    font-weight: bold;
}

.tag.manager {
    background: steelblue;
}

.tag.contributor {
    background: skyblue;
}
</style>

<style>
.table-projects {
    margin-top: 20px;
}

.detail-container {
    padding: 5px !important;
    font-size: 14px;
}

.list-projects-wrapper td, .list-projects-wrapper th {
    vertical-align: middle !important;
}
</style>
