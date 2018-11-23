<!-- TODO: synchronisation of annotations if several maps of the same image -->
<template>
<div class="cytomine-viewer">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">
        <div class="viewer-header">
            <b-select :placeholder="$t('select-image-to-add')" v-model="imageToAdd">
                <option v-for="image in images" :key="image.id" :value="image">{{image.instanceFilename}}</option>
            </b-select>
            <button class="button" @click="addMap()">{{$t("button-add-viewer")}}</button>
        </div>

        <div class="maps-wrapper">
            <div class="map-cell" v-for="idx in nbHorizontalCells*nbVerticalCells" :key="idx"
                 :style="`height:${elementHeight}%; width:${elementWidth}%;`">
                <cytomine-image v-if="idx <= nbMaps"
                    :idViewer="idBaseImage"
                    :index="idx-1"
                    :key="`${idBaseImage}-${idx}-${viewer.maps[idx-1].imageInstance.id}`" 
                    @close="closeMap(idx-1)">
                </cytomine-image>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import CytomineImage from "./CytomineImage";

import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "cytomine-viewer",
    components: {CytomineImage},
    props: ["project"],
    data() {
        return {
            loading: true,

            images: [],
            imageToAdd: null
        };
    },
    computed: {
        idBaseImage() {
            return this.$route.params.idImage;
        },
        viewer() {
            return this.$store.state.images.viewers[this.idBaseImage];
        },
        nbMaps() {
            return this.viewer ? this.viewer.maps.length : 0;
        },
        nbHorizontalCells() {
            return Math.ceil(Math.sqrt(this.nbMaps));
        },
        nbVerticalCells() {
            return this.nbHorizontalCells ? Math.ceil(this.nbMaps/this.nbHorizontalCells) : 0;
        },
        elementHeight() {
            return 100/this.nbVerticalCells;
        },
        elementWidth() {
            return 100/this.nbHorizontalCells;
        }
    },
    watch: {
        nbMaps() {
            this.$store.commit("triggerMapUpdateSize");
        }
    },
    methods: {
        async addMap(image=this.imageToAdd) {
            if(image == null) {
                return;
            }

            await this.$store.dispatch("addMap", {idViewer: this.idBaseImage, image});
            this.imageToAdd = null;
        },
        closeMap(index) {
            if(this.nbMaps == 1) {
                this.$store.commit("removeViewer", this.idBaseImage);
                this.$router.push("/"); // TODO: change
            }
            else {
                this.$store.commit("removeMap", {idViewer: this.idBaseImage, index});
            }
        }
    },
    async created() {
        this.images = (await ImageInstanceCollection.fetchAll({
            filterKey: "project", 
            filterValue: this.project.id
        })).array;

        if(this.viewer == null) {
            let baseImage = this.images.find(image => image.id == this.idBaseImage);
            if(baseImage != null) {
                await this.$store.dispatch("addViewer", baseImage);
            }
        }

        this.loading = false;
    }
};
</script>

<style scoped>
.cytomine-viewer {
    display: flex;
    flex-direction: column;
    height: 100% !important;
    position: relative;
}

.viewer-header {
    padding: 5px;
    display: flex;
}

.viewer-header button {
    margin-left: 10px;
}

.maps-wrapper {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
}

.map-cell {
    border-top: 3px solid #222;
    overflow: hidden;
}
</style>

<style>
.cytomine-viewer select {
    width: 250px;
}
</style>