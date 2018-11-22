<template>
<div class="annotation-details-playground">
    <vue-draggable-resizable v-if="selectedFeature && selectedFeature.properties && displayAnnotDetails"
                            class="draggable"
                            :parent="true" 
                            :resizable="false" 
                            drag-handle=".drag"
                            @dragstop="dragStop"
                            :w="350" :h="500" :x="positionAnnotDetails.x" :y="positionAnnotDetails.y">

        <div class="actions">
            <h1>{{$t("current-selection")}}</h1>
            <button class="drag button is-small close">
                <b-icon icon="arrows" size="is-small"></b-icon>
            </button>
            <button class="button is-small close" @click="displayAnnotDetails = false">
                <b-icon icon="times" size="is-small"></b-icon>
            </button>
        </div>

        <div class="annotation-details-container">
            <annotation-details :annotation="selectedFeature.properties.annot"
                                :terms="imageWrapper.terms"
                                :users="allUsers"
                                :showImageInfo="false"
                                :key="selectedFeature.id"
                                @updateTerms="updateTerms()"
                                @updateProperties="updateProperties()"
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

export default {
    name: "annotations-details-container",
    components: {VueDraggableResizable, AnnotationDetails},
    props: ["image"],
    data() {
        return {
            users: [],
            userJobs: []
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.images[this.image.id];
        },
        displayAnnotDetails: {
            get() {
                return this.imageWrapper.displayAnnotDetails;
            },
            set(value) {
                this.$store.commit("setDisplayAnnotDetails", {idImage: this.image.id, value});
            }
        },
        positionAnnotDetails: {
            get() {
                return this.imageWrapper.positionAnnotDetails;
            },
            set(value) {
                this.$store.commit("setPositionAnnotDetails", {idImage: this.image.id, value});
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
            return this.users.concat(this.userJobs);
        },
        layers() {
            return this.imageWrapper.selectedLayers || [];
        },
        annot() {
            return this.selectedFeature ? this.selectedFeature.properties.annot : {};
        },
        olSource() {
            let layer = this.layers.find(layer => layer.id == this.annot.user);
            return layer != null ? layer.olSource : null;
        },
        olFeature() {
            if(this.olSource != null) {
                return this.olSource.getFeatureById(this.annot.id);
            }
        }
    },
    watch: {
        selectedFeature() {
            if(this.selectedFeature != null) {
                this.displayAnnotDetails = true;
            }
        }
    },
    methods: {
        async fetchUsers() {
            this.users = (await UserCollection.fetchAll()).array;
            this.users.forEach(user => {
                user.fullName = fullName(user);
            });
        },
        async fetchUserJobs() {
            this.userJobs = (await UserJobCollection.fetchAll({filterKey: "project", filterValue: this.image.project})).array;
            this.userJobs = this.userJobs.reduce((arr, userJob) => {
                if(userJob.id != null) {
                    let date = this.$options.filters.moment(Number(userJob.created), "DD/MM/YYYY, HH:mm");
                    userJob.fullName = `${userJob.softwareName} - ${date}`;
                    arr.push(userJob);
                }
                return arr;
            }, []);

            this.selectedUserJobs = this.userJobs;
        },
        
        async updateTerms() {
            // TODO in backend: include userByTerm in annotation fetch() response
            let updatedAnnot = await this.annot.clone().fetch();
            let annotTerms = await AnnotationTermCollection.fetchAll({filterKey: "annotation", filterValue: this.annot.id});
            updatedAnnot.userByTerm = annotTerms.array.map(({term, user}) => {
                return {term, user: [user]};
            });

            if(this.olFeature != null) {
                this.olFeature.set("annot", updatedAnnot);
            }
            this.selectedFeature.properties.annot = updatedAnnot;
        },

        updateProperties() {
            this.$store.dispatch("refreshProperties", this.image.id);
        },

        handleDeletion() {
            if(this.olFeature != null) {
                this.olFeature.set("deleted", true);
                this.olSource.removeFeature(this.olFeature);
            }

            this.$store.commit("addAction", {idImage: this.image.id, feature: this.olFeature, oldAnnot: this.annot});
            this.$store.commit("clearSelectedFeatures", this.image.id);
            // TODO this.$store.commit("decrementAnnotCount", {idImage: this.image.id, idLayer: annot.user});
        },

        dragStop(x, y) {
            this.positionAnnotDetails = {x, y};
        }
    },
    created() {
        this.fetchUsers();
        this.fetchUserJobs();  
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
    z-index: 10 !important;
}
</style>