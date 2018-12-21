<template>
    <div class="project-container">
        <project-sidebar v-if="project" :key="idProject"></project-sidebar>

        <div class="app-content" v-if="project && project.id == idProject">
            <router-view :key="$route.path">
            </router-view>
        </div>
    </div>
</template>

<script>
import ProjectSidebar from "./ProjectSidebar.vue";

export default {
    name: "cytomine-project",
    components: {ProjectSidebar},
    computed: {
        idProject() {
            return this.$route.params.idProject;
        },
        project() {
            return this.$store.state.project.project;
        }
    },
    watch: {
        idProject() {
            this.loadProject();
        }
    },
    methods: {
        loadProject() {
            this.$store.dispatch("loadProject", this.idProject);
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
