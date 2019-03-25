<template>
<div class="box error" v-if="!configUI['project-information-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div v-else class="box">
    <project-details :project="project" :excluded-properties="['imagesPreview']" @delete="deleteProject()" />
</div>
</template>

<script>
import ProjectDetails from "./ProjectDetails";
import {Project} from "cytomine-client";

export default {
    name: "project-information",
    components: {ProjectDetails},
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        configUI() {
            return this.$store.state.project.configUI;
        }
    },
    methods: {
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
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>