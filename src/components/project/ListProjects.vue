<template>
<div class="list-projects-wrapper content-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div class="box error" v-if="error">
        <h2> {{ $t("error") }} </h2>
        <p>{{ $t("unexpected-error-info-message") }}</p>
    </div>
    <div v-else-if="!loading" class="panel">
        <p class="panel-heading">
            {{$t("projects")}}
            <button v-if="!currentUser.guestByNow" class="button is-link" @click="creationModal = true">
                {{$t('new-project')}}
            </button>
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
                                    :searchable="false">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column"></div>
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

                        <div class="column"></div>
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
                                {{$t("analysis-annotations")}}
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
                <template v-slot:default="{row: project}">
                    <b-table-column :visible="showRole" field="roleIndex" label="" centered width="1" sortable>
                        <i v-if="project.currentUserRoles.admin" class="fas fa-cog"
                           :title="$t(project.currentUserRoles.representative ? 'representative-icon-label' : 'manager-icon-label')">
                            <i v-if="project.currentUserRoles.representative" class="superscript fas fa-plus"></i>
                        </i>
                    </b-table-column>

                    <b-table-column field="name" :label="$t('name')" sortable width="250">
                        <router-link :to="`/project/${project.id}`">
                            {{ project.name }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="membersCount" :label="$t('members')" centered sortable width="150">
                        {{ project.membersCount }}
                    </b-table-column>

                    <b-table-column field="numberOfImages" :label="$t('images')" centered sortable width="150">
                        <router-link :to="`/project/${project.id}/images`">{{ project.numberOfImages }}</router-link>
                    </b-table-column>

                    <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="150">
                        <router-link :to="`/project/${project.id}/annotations`">
                            {{ project.numberOfAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfJobAnnotations" :label="$t('analysis-annotations')" centered sortable width="150">
                        <router-link :to="`/project/${project.id}/annotations?type=algo`">
                            {{ project.numberOfJobAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="150">
                        <router-link :to="`/project/${project.id}/annotations?type=reviewed`">
                            {{ project.numberOfReviewedAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="lastActivity" :label="$t('last-activity')" centered sortable width="180">
                        {{ Number(project.lastActivity) | moment("ll") }}
                    </b-table-column>

                    <b-table-column label=" " centered width="150">
                        <router-link :to="`/project/${project.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template v-slot:detail="{row: project}">
                    <project-details :project="project"
                        :excluded-properties="excludedProperties"
                        @delete="deleteProject(project)">
                    </project-details>
                </template>

                <template v-slot:empty>
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-project")}}</p>
                    </div>
                </template>

                <template v-slot:bottom-left>
                    <b-select v-model="perPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>

            <div class="legend" v-if="showRole">
                <h2>{{$t("legend")}}</h2>
                <p><i class="fas fa-cog"></i> : {{$t('manager-icon-label')}}</p>
                <p><i class="fas fa-cog">
                    <i class="superscript fas fa-plus"></i>
                </i> : {{$t('representative-icon-label')}}</p>
            </div>
        </div>
    </div>

    <add-project-modal :active.sync="creationModal"></add-project-modal>
</div>
</template>

<script>
import { mapState } from "vuex";

import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import CytomineSlider from "@/components/form/CytomineSlider";
import ProjectDetails from "./ProjectDetails";
import AddProjectModal from "./AddProjectModal";

import isBetweenBounds from "@/utils/is-between-bounds.js";

import {ProjectCollection} from "cytomine-client";

export default {
    name: "list-projects",
    components: {
        ProjectDetails,
        AddProjectModal,
        CytomineMultiselect,
        CytomineSlider
    },
    data() {
        return {
            loading: true,
            error: false,

            projects: [],
            searchString: "",
            perPage: 10,

            // filters
            filtersOpened: false,
            initSliders: false,
            selectedOntologies: [],
            availableRoles: [],
            contributorLabel: null,
            managerLabel: null,
            selectedRoles: [],
            boundsMembers: [0, 0],
            boundsImages: [0, 0],
            boundsUserAnnotations: [0, 0],
            boundsJobAnnotations: [0, 0],
            boundsReviewedAnnotations: [0, 0],

            creationModal: false,
            nameNewProject: "",

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

            let includeContributor = this.selectedRoles.includes(this.contributorLabel);
            let includeManager = this.selectedRoles.includes(this.managerLabel);

            filtered = filtered.filter(project => {
                let managedProject = project.currentUserRoles.admin;
                let roleIncluded = (includeContributor && !managedProject) || (includeManager && managedProject);
                return this.selectedOntologiesIds.includes(project.ontology) &&
                    roleIncluded &&
                    isBetweenBounds(project.numberOfImages, this.boundsImages) &&
                    isBetweenBounds(project.membersCount, this.boundsMembers) &&
                    isBetweenBounds(project.numberOfAnnotations, this.boundsUserAnnotations) &&
                    isBetweenBounds(project.numberOfJobAnnotations, this.boundsJobAnnotations) &&
                    isBetweenBounds(project.numberOfReviewedAnnotations, this.boundsReviewedAnnotations);
            });

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
        showRole() { // show role iff the current user is manager or representative of at least one project
            return this.projects.some(project => project.currentUserRoles.admin || project.currentUserRoles.representative);
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
        try {
            let projects = await ProjectCollection.fetchAll({
                withMembersCount: true,
                withLastActivity: true,
                withCurrentUserRoles: true
            });

            this.contributorLabel = this.$t("contributor");
            this.managerLabel = this.$t("manager");
            this.availableRoles = [this.contributorLabel, this.managerLabel];
            this.selectedRoles = this.availableRoles;

            this.projects = projects.array.map(project => {
                let roles = project.currentUserRoles;
                project.roleIndex = Number(roles.admin) + Number(roles.representative); // to allow sorting
                return project;
            });

            this.selectedOntologies = this.ontologies;

            this.boundsMembers = [0, this.maxNbMembers];
            this.boundsImages = [0, this.maxNbImages];
            this.boundsUserAnnotations = [0, this.maxNbUserAnnotations];
            this.boundsJobAnnotations = [0, this.maxNbJobAnnotations];
            this.boundsReviewedAnnotations = [0, this.maxNbReviewedAnnotations];
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
.panel-block {
    padding-top: 10px;
}

.panel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.legend p:not(:last-child) {
    margin-bottom: 10px;
}

.fas.fa-cog {
    width: 25px;
    position: relative;
}

.superscript {
    font-size: 8px;
    position: absolute;
    top: -3px;
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
