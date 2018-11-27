<template>
    <div class="project-container">
        <project-sidebar v-if="project" :project="project" :key="idProject"></project-sidebar>

        <div class="app-content" v-if="project && project.id == idProject">
            <router-view :key="$route.path" :project="project"></router-view>
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
            await this.project.recordUserConnection();
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

.app-content {
    flex: 1;
    position: relative;
    overflow-y: auto;
}
</style>
