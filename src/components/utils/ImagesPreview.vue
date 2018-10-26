<template>
<div class="columns" v-if="images && images.length">
    <div class="column" v-for="image in images.array" :key="image.id">
        <div class="card">
            <router-link class="card-image recent-image" :to="`project/${image.project}/image/${image.id}`"
                :style="'background-image: url(' + image.thumb + ')'">
            </router-link>
            <div class="card-content">
                <div class="content">
                    <router-link :to="`project/${image.project}/image/${image.id}`">
                        {{ image.instanceFilename }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    <div class="column vertical-center">
        <router-link class="button" :to="`project/${idProject}/images`">{{$t("button-view-all")}}</router-link>
    </div>
</div>
<div v-else>
    {{$t("no-image")}}
</div>
</template>

<script>
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
    async created() {
        // TODO: fetch last opened ? waiting for https://github.com/cytomine/Cytomine-core/issues/1126
        this.images = await new ImageInstanceCollection({max: this.nbRecent, filterKey:"project", filterValue: this.idProject}).fetchPage();
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
    font-weight: bold;
}

.vertical-center {
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>
