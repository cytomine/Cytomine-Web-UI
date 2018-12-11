<template>
<div class="box">
    <project-details :project="project" :showImages="false">
    </project-details>
</div>
</template>

<script>
import ProjectDetails from "./ProjectDetails";

export default {
    name: "project-information",
    components: {ProjectDetails},
    props: ["project"]
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>