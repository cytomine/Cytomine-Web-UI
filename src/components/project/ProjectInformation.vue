<template>
<div class="box">
    <project-details :project="project" :excluded-properties="['imagesPreview']">
    </project-details>
</div>
</template>

<script>
import ProjectDetails from "./ProjectDetails";

export default {
    name: "project-information",
    components: {ProjectDetails},
    computed: {
        project() {
            return this.$store.state.project.project;
        }
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>