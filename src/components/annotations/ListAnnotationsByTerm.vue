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

            <div class="annot-preview" :style="styleAnnotDetails(annot)" @click.stop="toggle(annot.id)">
                <button class="button is-small">
                    <i :class="['fas', openedAnnot == annot.id ? 'fa-minus' : 'fa-plus']"></i>
                </button>
            </div>

            <template v-slot:popover>
                <annotation-details
                    v-click-outside="(event) => close(event, annot.id)"
                    :annotation="annot"
                    :terms="allTerms"
                    :users="allUsers"
                    :images="allImages"
                    @addTerm="term => $emit('addTerm', term)"
                    @updateTerms="$emit('update', annot.id)"
                    @deletion="$emit('update', annot.id)"
                    v-if="openedAnnot == annot.id"> <!-- Display component only if it is the currently displayed annotation
                    (prevents fetching unnecessary information) -->
                </annotation-details>
            </template>
        </v-popover>
        
        <b-pagination
            :total="nbAnnotations"
            :current="currentPage"
            size="is-small"
            :per-page="nbPerPage"
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
        "nbPerPage",
        "size",
        "color",

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
                max: this.nbPerPage
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
                this.nbAnnotations = data.totalNbItems;

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
        toggle(id) {
            this.openedAnnot = this.openedAnnot === id ? 0 : id;
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
        },
        cropURL(annot) {
            let outlineParams = this.color ? "&draw=true&color=0x" + this.color : "";
            return `${annot.url}?maxSize=${this.size}&square=true&complete=true&thickness=2&increaseArea=1.25${outlineParams}`;
        },
        styleAnnotDetails(annot) {
            return {
                backgroundImage: `url(${this.cropURL(annot)})`,
                width: this.size + "px",
                height: this.size + "px"
            };
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
    background-position: center center;
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
