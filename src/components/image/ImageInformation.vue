<template>
<div class="box">
    <template v-if="image">
        <i18n path="detailed-image-information" tag="h1">
            <router-link place="imageName" :to="`/project/${image.project}/image/${image.id}`">
                {{ image.instanceFilename }}
            </router-link>
        </i18n>

        <image-details v-if="image" :image="image" 
            @setResolution="resolution => image.resolution = resolution"
            @setMagnification="magnification => image.magnification = magnification"
            @delete="deleteImage()" />
    </template>
</div>
</template>

<script>
import ImageDetails from "./ImageDetails";

import {ImageInstance} from "cytomine-client";
import vendorFromMime from "@/utils/vendor";

export default {
    name: "image-information",
    components: {ImageDetails},
    data() {
        return {
            image: null
        };
    },
    methods: {
        deleteImage() {
            this.$router.push(`/project/${this.image.project}`);
        },
    },
    async created() {
        let image = await ImageInstance.fetch(this.$route.params.idImage);
        image.vendor = vendorFromMime(image.mime);
        this.image = image;
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>