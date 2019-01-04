<template>
<div class="image-selector-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">
        <div class="header">
            <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')"
                    type="search" icon="search"></b-input>
            <button class="delete" @click="cancelMapCreation"></button>
        </div>
        <div class="image-selector">
            <div class="card" v-for="(image, index) in filteredImages" :key="image.id" v-if="index <nbImagesDisplayed">
                <a class="card-image" @click="addMap(image)" :style="'background-image: url(' + image.preview + ')'"></a>
                <div class="card-content">
                    <div class="content">
                        <a @click="addMap(image)" :title="image.instanceFilename">
                            {{ image.instanceFilename }}
                        </a>
                    </div>
                </div>
            </div>

            <button class="button" v-if="nbImagesDisplayed < filteredImages.length" @click="more()">
                {{$t("button-more")}}
            </button>

            <div class="space">&nbsp;</div>
        </div>
    </template>
</div>
</template>

<script>
import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "image-selector",
    props: [
        "project", 
        "idViewer"
    ],
    data() {
        return {
            images: [],
            searchString: "",
            nbImagesDisplayed: 20,
            loading: true
        };
    },
    computed: {
        filteredImages() { // TODO: in backend
            let filtered = this.images;

            if(this.searchString != "") {
                let str = this.searchString.toLowerCase();
                filtered =  filtered.filter(image => {
                    return image.instanceFilename.toLowerCase().indexOf(str) >= 0;
                });
            }
            
            return filtered;
        }
    },
    methods: {
        async addMap(image) {
            await this.$store.dispatch("addMap", {idViewer: this.idViewer, image});
            this.imageToAdd = null;
        },

        cancelMapCreation() {
            this.$store.commit("setImageSelector", {idViewer: this.idViewer, value: false});
        },

        more() {
            this.nbImagesDisplayed += 20;
        }
    },
    async created() {
        this.images = (await ImageInstanceCollection.fetchAll({
            filterKey: "project",
            filterValue: this.project.id
        })).array; // TODO: should not load full array, should be done with backend

        this.loading = false;
    }
};
</script>

<style scoped>
.image-selector-wrapper {
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    width: 100%;
    height: 270px;
    z-index: 20;
}

.header {
    padding: 10px 10px 0px 10px;
    display: flex;
    justify-content: space-between;
}

.image-selector {
    width: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    flex: 1;
}

.card {
    display: inline-block;
    min-width: 160px;
    flex: 0;
    box-sizing: border-box;
    margin: 10px;
}

.card-image {
    display: inline-block;
    width: 100%;
    height: 120px;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: white;
    border-bottom: 1px solid #ddd;
}

.card-content {
    padding: 10px;
    font-size: 12px;
    word-break: break-all;
    overflow: hidden;
    height: 60px;
}

.space {
    margin-left: 5px;
}

</style>