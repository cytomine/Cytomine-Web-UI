<template>
<div class="columns" v-if="images && images.length">
    <div class="column" v-for="image in images" :key="image.image">
        <image-preview :image="image" :blindMode="project.blindMode" />
    </div>
    <div class="column vertical-center">
        <router-link class="button" :to="`/project/${this.project.id}/images`">{{$t("button-view-all")}}</router-link>
    </div>
</div>
<div v-else>
    {{$t("no-image")}}
</div>
</template>

<script>
import {mapState} from "vuex";

import {ImageInstanceCollection} from "cytomine-client";

import ImagePreview from "./ImagePreview";

export default {
    name: "list-images-preview",
    components: {ImagePreview},
    props: {
        project: Object,
        nbRecent: {
            type: Number,
            default: 3
        }
    },
    data() {
        return {
            images: []
        };
    },
    computed: {
        ...mapState({currentUser: state => state.currentUser.user})
    },
    async created() {
        this.images = await ImageInstanceCollection.fetchLastOpened({
            max: this.nbRecent,
            project: this.project.id,
            user: this.currentUser.id
        });
    }
};
</script>

<style scoped>

.column {
    max-width: 200px;
    min-width: 150px;
}

.vertical-center {
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>
