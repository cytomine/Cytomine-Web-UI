<template>
<div v-if="error" class="box error">
    <h2> {{ $t("error") }} </h2>
    <p>{{ $t("error-loading-image") }}</p>
</div>
<div v-else class="cytomine-viewer">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading" class="maps-wrapper">
        <div class="map-cell" v-for="idx in nbHorizontalCells*nbVerticalCells" :key="idx"
                :style="`height:${elementHeight}%; width:${elementWidth}%;`">
            <cytomine-image v-if="idx <= nbMaps"
                :idViewer="idViewer"
                :index="idx-1"
                :key="`${idViewer}-${idx}-${viewer.maps[idx-1].imageInstance.id}`"
                @close="closeMap(idx-1)">
            </cytomine-image>
        </div>

        <image-selector :idViewer="idViewer"></image-selector>
    </div>
</div>
</template>

<script>
import CytomineImage from "./CytomineImage";
import ImageSelector from "./ImageSelector";

import constants from "@/utils/constants.js";

export default {
    name: "cytomine-viewer",
    components: {
        CytomineImage,
        ImageSelector
    },
    data() {
        return {
            error: false,
            loading: true,
            reloadInterval: null,
            idViewer: null
        };
    },
    computed: {
        viewers() {
            return this.$store.state.images.viewers;
        },
        idImages() {
            return this.$route.params.idImages.split("-");
        },
        paramIdViewer() {
            return this.$route.query.viewer;
        },
        viewer() {
            return this.viewers[this.idViewer];
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
        paramIdViewer() {
            this.findIdViewer();
        },
        idViewer(_, old) {
            if(old != null) {
                this.loading = true;
                this.loadViewer();
            }
        },
        nbMaps() {
            this.$eventBus.$emit("updateMapSize");
        }
    },
    methods: {
        findIdViewer() {
            if(this.paramIdViewer != null) {
                this.idViewer = this.paramIdViewer;
                return;
            }

            for(let id in this.viewers) {
                if(this.viewers[id].maps.map(map => map.imageInstance.id).join("-") == this.$route.params.idImages) {
                    this.idViewer = id;
                    return;
                }
            }

            this.idViewer = "_" + Math.random().toString(36).substr(2, 9); // TODO: change the ways IDs are generated (discuss with team)
        },

        closeMap(index) {
            if(this.nbMaps == 1) {
                this.$store.commit("removeViewer", this.idViewer);
                this.$router.push(`/project/${this.$route.params.idProject}`);
            }
            else {
                this.$store.dispatch("removeMap", {idViewer: this.idViewer, index});
            }
        },

        async loadViewer() {
            try {
                if(this.viewer == null) {
                    await this.$store.dispatch("addViewer", {
                        idViewer: this.idViewer,
                        idProject: this.$route.params.idProject,
                        idImages: this.idImages
                    });
                }
                else {
                    await this.$store.dispatch("refreshData", this.idViewer);
                }
                this.loading = false;
            }
            catch(err) {
                console.log(err);
                this.error = true;
            }
        }
    },
    async created() {
        this.findIdViewer();
        await this.loadViewer();
        this.reloadInterval = setInterval(
            () => this.$eventBus.$emit("reloadAnnotations"),
            constants.VIEWER_ANNOTATIONS_REFRESH_INTERVAL
        );
    },
    beforeDestroy() {
        clearInterval(this.reloadInterval);
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
</style>
