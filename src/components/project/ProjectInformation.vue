<template>
<!-- <div class="box error" v-if="!configUI['project-info-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div> TODO once core handles info-tab field -->
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