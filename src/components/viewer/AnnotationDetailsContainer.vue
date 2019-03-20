<template>
<div class="annotation-details-playground" ref="playground">
    <vue-draggable-resizable v-if="selectedFeature && selectedFeature.properties && reload"
                            v-show="displayAnnotDetails"
                            class="draggable"
                            :parent="true" 
                            :resizable="false" 
                            drag-handle=".drag"
                            @dragstop="dragStop"
                            :w="width" :h="height" :x="positionAnnotDetails.x" :y="positionAnnotDetails.y">

        <div class="actions">
            <h1>{{$t("current-selection")}}</h1>
            <button class="drag button is-small close">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="button is-small close" @click="displayAnnotDetails = false">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="annotation-details-container">
            <annotation-details :annotation="selectedFeature.properties.annot"
                                :terms="imageWrapper.terms"
                                :users="allUsers"
                                :showImageInfo="false"
                                :key="selectedFeature.id"
                                :showComments="showComments"
                                @addTerm="addTerm"
                                @updateTerms="updateTerms()"
                                @updateProperties="updateProperties()"
                                @centerView="centerViewOnAnnot()"
                                @deletion="handleDeletion()">
            </annotation-details>
        </div>
    </vue-draggable-resizable>
</div>
</template>

<script>
import VueDraggableResizable from "vue-draggable-resizable";

import AnnotationDetails from "@/components/annotations/AnnotationDetails";
import {AnnotationTermCollection, UserCollection, UserJobCollection} from "cytomine-client";
import {fullName} from "@/utils/user-utils.js";

import WKT from "ol/format/WKT";

export default {
    name: "annotations-details-container",
    components: {VueDraggableResizable, AnnotationDetails},
    props: [
        "idViewer",
        "index",
        "view"
    ],
    data() {
        return {
            width: 350,
            height: 500,
            users: [],
            userJobs: [],
            reload: true,
            format: new WKT(),
            showComments: false
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        displayAnnotDetails: {
            get() {
                return this.imageWrapper.displayAnnotDetails;
            },
            set(value) {
                this.$store.commit("setDisplayAnnotDetails", {idViewer: this.idViewer, index: this.index, value});
            }
        },
        positionAnnotDetails: {
            get() {
                return this.imageWrapper.positionAnnotDetails;
            },
            set(value) {
                this.$store.commit("setPositionAnnotDetails", {idViewer: this.idViewer, index: this.index, value});
            }
        },
        selectedFeatures() {
            return this.imageWrapper.selectedFeatures;
        },
        selectedFeature() {
            if(this.selectedFeatures && this.selectedFeatures.length == 1) {
                return this.selectedFeatures[0];
            }
        },
        allUsers() {
            let allUsers = this.users.concat(this.userJobs);
            allUsers.forEach(user => user.fullName = fullName(user));
            return allUsers;
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        annot() {
            return this.selectedFeature ? this.selectedFeature.properties.annot : {};
        }
    },
    watch: {
        selectedFeature() {
            if(this.selectedFeature != null) {
                this.displayAnnotDetails = true;
                let targetAnnot = this.imageWrapper.showComments;
                this.showComments = targetAnnot == this.annot.id;
                if(targetAnnot !== null) {
                    this.$store.commit("setShowComments", {idViewer: this.idViewer, index: this.index, annot: null});
                }
            }
        }
    },
    methods: {
        async fetchUsers() { // TODO in vuex (project module)
            this.users = (await UserCollection.fetchAll()).array;
        },
        async fetchUserJobs() { // TODO in vuex (project module)
            this.userJobs = (await UserJobCollection.fetchAll({
                filterKey: "project",
                filterValue: this.image.project
            })).array;
        },

        centerViewOnAnnot() {
            let geometry = this.format.readGeometry(this.annot.location);
            this.view.fit(geometry, {duration: 500, padding: [10, 10, 10, 10], maxZoom: this.image.depth});
        },
        
        addTerm(term) {
            this.$store.commit("addTerm", {idViewer: this.idViewer, term});
        },

        async updateTerms() {
            // TODO in backend: include userByTerm in annotation fetch() response
            let updatedAnnot = await this.annot.clone().fetch();
            let annotTerms = await AnnotationTermCollection.fetchAll({filterKey: "annotation", filterValue: this.annot.id});
            updatedAnnot.userByTerm = annotTerms.array.map(({term, user}) => {
                return {term, user: [user]};
            });

            this.$eventBus.$emit("editAnnotation", updatedAnnot);
            this.$store.commit("changeAnnotSelectedFeature", {
                idViewer: this.idViewer,
                index: this.index,
                indexFeature: 0,
                annot: updatedAnnot
            });
        },

        updateProperties() {
            this.$store.dispatch("refreshProperties", {idViewer: this.idViewer, index: this.index});
        },

        handleDeletion() {
            this.$store.commit("addAction", {
                idViewer: this.idViewer,
                index: this.index,
                annot: null,
                oldAnnot: this.annot
            });
            this.$eventBus.$emit("deleteAnnotation", this.annot);
        },

        dragStop(x, y) {
            this.positionAnnotDetails = {x, y};
        },

        async handleResize() {
            await this.$nextTick(); // wait for update of clientWidth and clientHeight to their new values

            if(this.$refs.playground) {
                let maxX = Math.max(this.$refs.playground.clientWidth - this.width, 0);
                let maxY = Math.max(this.$refs.playground.clientHeight - this.height, 0);
                let x = Math.min(this.positionAnnotDetails.x, maxX);
                let y = Math.min(this.positionAnnotDetails.y, maxY);
                this.positionAnnotDetails = {x, y};

                // HACK to force the component to recreate and take into account new (x,y) ; should no longer be
                // necessary with version 2 of vue-draggable-resizable
                this.reload = false;
                this.$nextTick(() => this.reload = true);
            }
        }
    },
    created() {
        this.fetchUsers();
        this.fetchUserJobs();
    },
    mounted() {
        window.addEventListener("resize", this.handleResize);
        this.$eventBus.$on("updateMapSize", this.handleResize);
    },
    destroyed() {
        window.removeEventListener("resize", this.handleResize);
        this.$eventBus.$off("updateMapSize", this.handleResize);
    }
};
</script>

<style scoped>
.annotation-details-playground {
    position: absolute;
    left: 50px;
    top: 50px;
    right: 70px;
    bottom: 20px;
    pointer-events: none; /* to allow selection of elements below it */
    /* background: rgba(255, 255, 255, 0.2);
    border: 2px dashed rgba(0, 0, 0, 0.5); */
}

.draggable {
    background: #f2f2f2;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    pointer-events: auto;
}

.actions {
    padding: 5px;
    text-align: right;
    background-color: #e5e5e5;
    border-bottom: 1px solid #b5b5b5;
    border-radius: 5px 5px 0px 0px;
    display: flex;
    align-items: center;
}

h1 {
    font-size: 14px;
    padding: 0px;
    flex: 1;
    text-align:left;
    margin-left: 5px;
}

.actions .button {
    margin-left: 3px;
    width: 27px;
}

.annotation-details-container {
    padding: 10px;
    overflow: auto;
    border-radius: 5px;
    height: 100%;
}
</style>

<style>
.dragging .button.drag {
    background-color: #6899d0;
    color: #fff;
}

.annotation-details-playground .draggable {
    z-index: 15 !important;
}
</style>