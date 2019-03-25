<template>
<div class="box error" v-if="!configUI['project-information-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div v-else class="box">
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
        },
        configUI() {
            return this.$store.state.project.configUI;
        }
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>