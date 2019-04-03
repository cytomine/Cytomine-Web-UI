<template>
    <div class="box error" v-if="permissionError || notFoundError">
        <h2> {{ $t(permissionError ? "access-denied" : "not-found") }} </h2>
        <p> {{ $t(permissionError ?  "insufficient-permission" : "not-found-error") }} </p>
    </div>
    <div v-else class="project-container">
        <project-sidebar v-if="project" :key="idProject" />

        <div class="app-content">
            <b-loading :is-full-page="false" :active="loading" />
            <router-view v-if="!loading" />
        </div>
    </div>
</template>

<script>
import ProjectSidebar from "./ProjectSidebar.vue";

export default {
    name: "cytomine-project",
    components: {ProjectSidebar},
    data() {
        return {
            loading: true,
            permissionError: false,
            notFoundError: false
        };
    },
    computed: {
        idProject() {
            return this.$route.params.idProject;
        },
        project() {
            return this.$store.state.project.project;
        }
    },
    watch: {
        async idProject() {
            this.loading = true;
            await this.loadProject();
        }
    },
    methods: {
        async loadProject() {
            try {
                await this.$store.dispatch("loadProject", this.idProject);
                this.loading = false;
            }
            catch(error) {
                console.log(error);
                if(error.response && error.response.status == 403) {
                    this.permissionError = true;
                }
                else {
                    this.notFoundError = true;
                }
            }
        }
    },
    async created() {
        await this.loadProject();
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
