<template>
<div class="box box-annotations">
    <h2> {{ title }} ({{nbAnnotations}}) </h2>
    <template v-if="annotations.length == 0">
        <em class="no-result">{{ $t("no-annotation") }}</em>
    </template>
    <template v-else>
        <v-popover v-for="annot in annotations" :key="title + annot.id" placement="right" trigger="manual" 
        :open="openedAnnot == annot.id" :auto-hide="false"> 
            <!-- autoHide leads to erratic behaviour when adding/showing DOM elements => handle display of popover manually -->

            <div class="annot-preview" :style="'background-image: url(' + annot.smallCropURL + ')'" 
            @click="openedAnnot = annot.id">
                <button class="button is-small">
                    <b-icon :icon="openedAnnot == annot.id ? 'minus' : 'plus'" size="is-small">
                </b-icon></button>    
            </div>

            <annotation-details slot="popover" v-click-outside="(event) => close(event, annot.id)"
                :annotation="annot"
                :terms="allTerms"
                :users="allUsers"
                :images="allImages"
                @update="$emit('update', annot.id)"
                v-if="openedAnnot == annot.id"> <!-- Display component only if it is the currently displayed annotation
                (prevents fetching unnecessary information) -->
            </annotation-details>
        </v-popover>
        
        <b-pagination
            :total="nbAnnotations"
            :current="currentPage"
            size="is-small"
            :per-page="perPage"
            @change="fetchPage">
        </b-pagination>
    </template>
</div> 
</template>

<script>
import AnnotationDetails from "./AnnotationDetails";

import {AnnotationCollection} from "cytomine-client";

export default {
    name: "list-annotations-by-term",
    components: {AnnotationDetails},
    props: [
        "term", 
        "multipleTerms", 
        "noTerm", 
        "imagesIds", 
        "usersIds",

        "allTerms", 
        "allUsers", 
        "allImages",
        
        "forceUpdate"
    ],
    data() {
        return {
            annotations: [],
            nbAnnotations: 0,
            perPage: 20,
            currentPage: 1,
            openedAnnot: 0
        };
    },
    computed: {
        collection() {
            this.forceUpdate; // to ensure that collection is reloaded if forceUpdate prop changes
            return new AnnotationCollection({
                images: this.imagesIds,
                term: this.multipleTerms || this.noTerm ? null : this.term.id,
                noTerm: this.noTerm,
                users: this.usersIds,
                multipleTerm: this.multipleTerms, 
                showTerm: true,
                showGIS: true,
                max: this.perPage
            });
        },
        title() {
            if(this.multipleTerms) {
                return this.$t("multiple-terms");
            }
            if(this.noTerm) {
                return this.$t("no-term");
            }
            return this.term.name;
        }
    },
    watch: {
        collection() {
            this.fetchPage(1);
        }
    },
    methods: {
        async fetchPage(numPage) {
            this.currentPage = numPage;
            if(this.imagesIds.length == 0 || this.usersIds.length == 0) {
                this.annotations = [];
                return;
            }

            try {
                let data = await this.collection.fetchPage(numPage - 1);
                this.annotations = data.array;
                this.nbAnnotations = data._total; // TODO add getter in collection

                // if openedAnnot no longer in collection (can happen if term was removed from annotation), 
                // reset openedAnnot value (otherwise, if annot added again to collection, popover reopens)
                if(!this.annotations.map(annot => annot.id).includes(this.openedAnnot)) {
                    this.openedAnnot = 0;
                }
            }
            catch(error) {
                this.annotations = [];
                this.nbAnnotations = 0;
                this.$notify({
                    type: "error", 
                    text: this.$t(
                        "notif-error-fetch-annots", 
                        {details: this.title}
                    )
                });
            }
        },
        close(event, id) {
            // do not close the popover if click was performed in modal or in notification
            let el = event.target;
            let isModal = false;
            while(!(isModal = el.classList.contains("modal") || el.classList.contains("notifications"))
                && (el = el.parentElement));

            if(!isModal && this.openedAnnot == id) {
                this.openedAnnot = 0;
            }
        }
    },
    created() {
        this.fetchPage(1);
    }
};
</script>

<style scoped>
.box {
    position: relative;
}

.annot-preview {
    display: inline-block;
    width: 100px;
    height: 100px;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    margin: 10px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    border: 3px solid white;
    cursor: pointer;
    text-align: right;
}

.annot-preview .button {
    font-size: 10px;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    position: relative;
    left: 3px;
    bottom: 3px;
    border: none;
}

.no-result {
    color: grey;
}
</style>

<style>
.box-annotations ul {
    justify-content: flex-end;
}
</style>
