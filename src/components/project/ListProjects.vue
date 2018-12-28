<template>
<div class="list-projects-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading" class="panel">
        <p class="panel-heading">
            {{$t("projects")}}
            <button class="button is-link" @click="creationModal = true">{{$t('new-project')}}</button>
        </p>
        <div class="panel-block">
            <div class="search-block">
                <b-input class="search-projects" v-model="searchString" :placeholder="$t('search-placeholder')"
                    type="search" icon="search"></b-input>
                <button class="button" @click="toggleFilterDisplay()">
                    <span class="icon">
                        <i class="fas fa-filter"></i>
                    </span>
                    <span>{{filtersOpened ? $t("button-hide-filters") : $t("button-show-filters")}}</span>
                </button>
            </div>

            <b-collapse :open="filtersOpened">
                <div class="filters">
                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("tags")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                                    label="name" track-by="id" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("ontology")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedOntologies" :options="ontologies"
                                    label="name" track-by="id" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("my-role")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" :multiple="true"
                                    label="label" track-by="role" :searchable="false">
                                </cytomine-multiselect>
                            </div>
                        </div>
                    </div>

                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("members")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsMembers" :max="maxNbMembers"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("images")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsImages" :max="maxNbImages"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column">

                        </div>
                    </div>

                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("user-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsUserAnnotations" :max="maxNbUserAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("job-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsJobAnnotations" :max="maxNbJobAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("reviewed-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>
                    </div>
                </div>
            </b-collapse>


            <b-table :data="filteredProjects" class="table-projects" :paginated="true" :per-page="perPage"
            pagination-size="is-small" detailed detail-key="id">
                <template slot-scope="props">
                    <b-table-column :visible="atLeastOneManaged" field="isManaged" label="" centered width="1" sortable>
                        <i v-if="props.row.isManaged" class="fas fa-cog" :title="$t('manager-icon-label')"></i>
                    </b-table-column>

                    <b-table-column field="name" :label="$t('name')" sortable width="250">
                        <router-link :to="`/project/${props.row.id}`">
                            {{ props.row.name }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="first_name" :label="$t('members')" centered sortable width="150">
                        {{ props.row.membersCount }}
                    </b-table-column>

                    <b-table-column field="numberOfImages" :label="$t('images')" centered sortable width="150">
                        <router-link :to="`/project/${props.row.id}/images`">{{ props.row.numberOfImages }}</router-link>
                    </b-table-column>

                    <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="150">
                        <router-link :to="`/project/${props.row.id}/annotations`">
                            {{ props.row.numberOfAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfJobAnnotations" :label="$t('job-annotations')" centered sortable width="150">
                        <router-link :to="`/project/${props.row.id}/annotations?type=algo`">
                            {{ props.row.numberOfJobAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="150">
                        <a>{{ props.row.numberOfReviewedAnnotations }}</a> <!-- TODO router link -->
                    </b-table-column>

                    <b-table-column field="lastActivity" :label="$t('last-activity')" centered sortable width="180">
                        {{ Number(props.row.lastActivity) | moment("ll") }}
                    </b-table-column>

                    <b-table-column label=" " centered width="150">
                        <router-link :to="`/project/${props.row.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template slot="detail" slot-scope="props">
                    <project-details :project="props.row"
                        :excluded-properties="excludedProperties"
                        @delete="deleteProject(props.row)">
                    </project-details>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-project")}}</p>
                    </div>
                </template>

                <template slot="bottom-left">
                    <b-select v-model="perPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>

            <div class="legend" v-if="atLeastOneManaged">
                <h2>{{$t("legend")}}</h2>
                <i class="fas fa-cog"></i> : {{$t('manager-icon-label')}}
            </div>
        </div>
    </div>

    <new-project-modal :active.sync="creationModal"></new-project-modal>
</div>
</template>

<script>
import { mapState } from "vuex";

import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import CytomineSlider from "@/components/form/CytomineSlider";
import ProjectDetails from "./ProjectDetails";
import NewProjectModal from "./NewProjectModal";

import isBetweenBounds from "@/utils/is-between-bounds.js";

import {ProjectCollection} from "cytomine-client";

export default {
    name: "list-projects",
    components: {
        ProjectDetails,
        NewProjectModal,
        CytomineMultiselect,
        CytomineSlider
    },
    data() {
        return {
            projects: [],
            searchString: "",
            perPage: 10,
            loading: true,
            // filters
            filtersOpened: false,
            initSliders: false,
            selectedOntologies: [],
            availableTags: [{id: 1, name:"Tag1"}, {id:2, name:"CHU"}, {id:3, name:"Demo"}], // TODO
            selectedTags: [],
            availableRoles: [],
            contributorRole: null,
            managerRole: null,
            selectedRoles: [],
            boundsMembers: [0, 0],
            boundsImages: [0, 0],
            boundsUserAnnotations: [0, 0],
            boundsJobAnnotations: [0, 0],
            boundsReviewedAnnotations: [0, 0],

            creationModal: false,
            nameNewProject: "",

            // TODO: should be defined in app config and retrieved from backend (corresponds to properties displayed in
            // columns in the list of project)
            excludedProperties: [
                "name",
                "membersCount",
                "numberOfImages",
                "numberOfAnnotations",
                "numberOfJobAnnotations",
                "numberOfReviewedAnnotations",
                "lastActivity"
            ]
        };
    },
    computed: {
        filteredProjects() {
            let filtered = this.projects;

            if(this.searchString != "") {
                let str = this.searchString.toLowerCase();
                filtered = filtered.filter(project => project.name.toLowerCase().indexOf(str) >= 0);
            }

            // TODO tags

            filtered = filtered.filter(project => this.selectedOntologiesIds.includes(project.ontology));

            let includeContributor = this.selectedRoles.includes(this.contributorRole);
            let includeManager = this.selectedRoles.includes(this.managerRole);
            filtered = filtered.filter(project => {
                return (includeContributor && !project.isManaged) || (includeManager && project.isManaged);
            });

            filtered = filtered.filter(project => isBetweenBounds(project.numberOfImages, this.boundsImages));
            filtered = filtered.filter(project => isBetweenBounds(project.membersCount, this.boundsMembers));
            filtered = filtered.filter(project =>
                isBetweenBounds(project.numberOfAnnotations, this.boundsUserAnnotations));
            filtered = filtered.filter(project =>
                isBetweenBounds(project.numberOfJobAnnotations, this.boundsJobAnnotations));
            filtered = filtered.filter(project =>
                isBetweenBounds(project.numberOfReviewedAnnotations, this.boundsReviewedAnnotations));

            return filtered;
        },
        maxNbMembers() {
            return Math.max(10, ...this.projects.map(project => project.membersCount));
        },
        maxNbImages() {
            return Math.max(10, ...this.projects.map(project => project.numberOfImages));
        },
        maxNbUserAnnotations() {
            return Math.max(100, ...this.projects.map(project => project.numberOfAnnotations));
        },
        maxNbJobAnnotations() {
            return Math.max(100, ...this.projects.map(project => project.numberOfJobAnnotations));
        },
        maxNbReviewedAnnotations() {
            return Math.max(100, ...this.projects.map(project => project.numberOfReviewedAnnotations));
        },
        atLeastOneManaged() {
            return this.projects.some(project => project.isManaged);
        },
        ontologies() {
            let seenIds = [];
            let ontologies = [];
            this.projects.forEach(project => {
                if(!seenIds.includes(project.ontology)) {
                    ontologies.push({id: project.ontology, name: project.ontologyName});
                    seenIds.push(project.ontology);
                }
            });
            return ontologies;
        },
        selectedOntologiesIds() {
            return this.selectedOntologies.map(ontology => ontology.id);
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    methods: {
        toggleFilterDisplay() {
            this.filtersOpened = !this.filtersOpened;
            this.initSliders = true; // for correct rendering of the sliders, need to show them only when container is displayed
        },
        async deleteProject(projectToDelete) {
            try {
                await projectToDelete.delete();
                this.projects = this.projects.filter(project => project.id != projectToDelete.id);
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-project-deletion", {projectName: projectToDelete.name})
                });
            }
            catch(error) {
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-project-deletion", {projectName: projectToDelete.name})
                });
            }
        }
    },
    async created() {
        let managedProjectsPromise = new ProjectCollection({
            light: true,
            admin: true,
            filterKey: "user",
            filterUser: this.currentUser.id
        }).fetchAll();

        let projects = await ProjectCollection.fetchAll({
            withMembersCount: true,
            withLastActivity: true
        });
        let managedProjects = await managedProjectsPromise;
        let idManagedProjects = managedProjects.array.map(project => project.id);

        this.projects = projects.array.map(project => {
            project.isManaged = Number(idManagedProjects.includes(project.id)); // cast to number to allow sorting
            return project;
        });

        this.selectedOntologies = this.ontologies;

        this.boundsMembers = [0, this.maxNbMembers];
        this.boundsImages = [0, this.maxNbImages];
        this.boundsUserAnnotations = [0, this.maxNbUserAnnotations];
        this.boundsJobAnnotations = [0, this.maxNbJobAnnotations];
        this.boundsReviewedAnnotations = [0, this.maxNbReviewedAnnotations];

        this.contributorRole = {role: "contributor", label: this.$t("contributor")};
        this.managerRole = {role: "manager", label: this.$t("manager")};
        this.availableRoles = [this.contributorRole, this.managerRole];
        this.selectedRoles = this.availableRoles;

        this.loading = false;
    }
};
</script>

<style scoped>
.list-projects-wrapper {
    padding: 30px 50px 30px 50px;
}

.panel-block {
    padding-top: 10px;
}

.panel-heading {
    display: flex;
    justify-content: space-between;
}

.search-block {
    display: flex;
}

.legend {
    margin-top: 10px;
    margin-bottom: 15px;
    border-radius: 10px;
    padding: 20px;
    background: #f8f8f8;
}
</style>

<style>
.search-projects {
    max-width: 300px;
    margin-right: 10px;
}

.table-projects {
    margin-top: 15px;
}

.detail-container {
    padding: 5px !important;
    font-size: 14px;
}

.list-projects-wrapper td, .list-projects-wrapper th {
    vertical-align: middle !important;
}
</style>
