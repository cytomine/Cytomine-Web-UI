<template>
<div class="cytomine-viewer">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">
        <div v-if="error" class="box">
            <h2> {{ $t("error") }} </h2>
            <p>{{ $t("error-loading-image") }}</p>
        </div>
        <div v-else class="maps-wrapper">
            <div class="map-cell" v-for="idx in nbHorizontalCells*nbVerticalCells" :key="idx"
                    :style="`height:${elementHeight}%; width:${elementWidth}%;`">
                <cytomine-image v-if="idx <= nbMaps"
                    :project="project"
                    :idViewer="idBaseImage"
                    :index="idx-1"
                    :key="`${idBaseImage}-${idx}-${viewer.maps[idx-1].imageInstance.id}`" 
                    @close="closeMap(idx-1)">
                </cytomine-image>
            </div>

            <image-selector v-show="imageSelector" class="image-selector-wrapper"
                :project="project" :idViewer="idBaseImage">
            </image-selector>
        </div>
    </template>
</div>
</template>

<script>
import CytomineImage from "./CytomineImage";
import ImageSelector from "./ImageSelector";

import {ImageInstance} from "cytomine-client";

export default {
    name: "cytomine-viewer",
    components: {
        CytomineImage,
        ImageSelector
    },
    props: ["project"],
    data() {
        return {
            error: false,
            loading: true,
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
        imageSelector() {
            return this.viewer ? this.viewer.imageSelector : false;
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
        closeMap(index) {
            if(this.nbMaps == 1) {
                this.$store.commit("removeViewer", this.idBaseImage);
                this.$router.push(`/project/${this.$route.params.idProject}`);
            }
            else {
                this.$store.dispatch("removeMap", {idViewer: this.idBaseImage, index});
            }
        },

        async fetchProjetMembers() {
            let managersPromise = this.project.fetchAdministrators();
            let membersPromise = this.project.fetchUsers();

            let managers = (await managersPromise).array;
            let members = (await membersPromise).array;

            let idsManagers = managers.map(user => user.id);
            let contributors = members.filter(user => !idsManagers.includes(user.id));

            this.project.managers = managers;
            this.project.contributors = contributors;
        },

        async addBaseImage() {
            try {
                if(this.viewer == null) {
                    let baseImage = await ImageInstance.fetch(this.idBaseImage);
                    await this.$store.dispatch("addViewer", baseImage);
                }
                else {
                    await this.$store.dispatch("refreshData", this.idBaseImage);
                }
            }
            catch(err) {
                console.log(err);
                this.error = true;
            }
        }
    },
    async created() {
        await Promise.all([this.fetchProjetMembers(), this.addBaseImage()]);

        this.loading = false;
    }
};
</script>

<style scoped>
.cytomine-viewer {
    height: 100%;
}

.maps-wrapper {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
}

.map-cell {
    border-top: 3px solid #222;
    overflow: hidden;
}

.image-selector-wrapper {
    position: absolute;
    left: 0px;
    bottom: 0px;
}

.box {
    width: 50%;
    margin: auto;
    margin-top: 50px;
}
</style>
