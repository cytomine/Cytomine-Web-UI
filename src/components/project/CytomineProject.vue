<template>
    <div class="project-container">
        <project-sidebar v-if="project" :project="project" :key="idProject"></project-sidebar>

        <div class="app-content" v-if="project">
            <!--
            Each image state is saved so that user can re-access its state later on
            QUESTION: allow to clean ? the cached component should be destroyed,
            but consequently the keep-alive does not work anymore (because destroyed object is
            still referenced)

            Should probably be handled in VueX
        -->

        <!-- <keep-alive include="cytomine-image"> -->
            <router-view :key="$route.path" :project="project"></router-view>
        <!-- </keep-alive> -->
        </div>
    </div>
</template>

<script>
import ProjectSidebar from "./ProjectSidebar.vue";

import {Project} from "cytomine-client";

export default {
    name: "cytomine-project",
    components: {ProjectSidebar},
    data() {
        return {
            project: null
        };
    },
    computed: {
        idProject() {
            return this.$route.params.idProject;
        }
    },
    watch: {
        idProject() {
            this.loadProject();
        }
    },
    methods: {
        async loadProject() {
            this.project = await Project.fetch(this.idProject);
        }
    },
    created() {
        this.loadProject();
    }
};
</script>

<style>
.project-container {
    display: flex;
    height: 100%;
    flex: 1;
    background: #d4d4d4;
    overflow-y: auto;
    position: relative;
}
</style>
