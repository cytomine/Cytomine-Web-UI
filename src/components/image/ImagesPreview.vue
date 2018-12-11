<template>
<div class="columns" v-if="images && images.length">
    <div class="column" v-for="image in images" :key="image.image">
        <div class="card">
            <router-link class="card-image recent-image" :to="`/project/${image.project}/image/${image.image}`"
                :style="'background-image: url(' + image.imageThumb + ')'">
            </router-link>
            <div class="card-content">
                <div class="content">
                    <router-link :to="`/project/${image.project}/image/${image.image}`">
                        {{ image.imageName }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    <div class="column vertical-center">
        <router-link class="button" :to="`/project/${idProject}/images`">{{$t("button-view-all")}}</router-link>
    </div>
</div>
<div v-else>
    {{$t("no-image")}}
</div>
</template>

<script>
import {mapState} from "vuex";

import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "images-preview",
    props: {
        idProject: {
            type: Number
        },
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
            project: this.idProject,
            user: this.currentUser.id
        });
    }
};
</script>

<style scoped>

.column {
    max-width: 200px;
}

.recent-image {
    width: 100%;
    height: 15vh;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    position: relative;
    border-bottom: 1px solid #ddd;
}

.card {
    height: 100%;
}

.card-content {
    padding: 20px;
    word-break: break-all;
}

.card-content a {
    font-weight: 600;
}

.vertical-center {
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>
