<template>
<div class="box error" v-if="!configUI['project-annotations-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="box error" v-else-if="error">
    <h2> {{ $t("error") }} </h2>
    <p>{{ $t("error-load-annotations-filters") }}</p>
</div>
<div v-else class="list-annotations-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading">
        <div class="box">
            <h2> {{ $t("display") }} </h2>
            <div class="filters">
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("preview-size")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedSize" :options="allowedSizes"
                                label="label" track-by="size"
                                :allow-empty="false" :searchable="false">
                            </cytomine-multiselect>
                        </div>
                    </div>
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("number-per-page")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="nbPerPage" :options="[10, 25, 50, 100]"
                                :allow-empty="false" :searchable="false">
                            </cytomine-multiselect>
                        </div>
                    </div>
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("outline-color")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedColor" :options="colors"
                                label="label" track-by="name"
                                :allow-empty="false" :searchable="false">
                            </cytomine-multiselect>
                        </div>
                    </div>
                </div>
            </div>

            <h2> {{ $t("filters") }} </h2>
            <div class="filters">
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("annotation-type")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedAnnotationType" :options="annotationTypes"
                                :allow-empty="false" :searchable="false">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div v-if="selectedAnnotationType === jobAnnotationOption" class="column filter">
                        <div class="filter-label">
                            {{$t("analyses")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedUserJobs" :options="userJobs"
                                label="fullName" track-by="id" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div v-else class="column filter">
                        <div class="filter-label">
                            {{$t(reviewed ? "reviewers" : "members")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedMembers" :options="members"
                                label="fullName" track-by="id" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>
                </div>

                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("images")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedImages" :options="images"
                                label="instanceFilename" track-by="id" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("terms")}}
                        </div>
                        <div class="filter-body">
                            <ontology-tree-multiselect :ontology="ontology"
                                :additionalNodes="additionalNodes"
                                v-model="selectedTermsIds">
                            </ontology-tree-multiselect>
                        </div>
                    </div>

                </div>
            </div>

            <h2 class="has-text-right"> {{ $t("download-results") }} </h2>
            <div class="buttons download-buttons">
                <!-- TODO in core: change URLs returned in column "View annotation on image" -->
                <a class="button is-link" :href="downloadURL('pdf')">{{$t("download-PDF")}}</a>
                <a class="button is-link" :href="downloadURL('csv')">{{$t("download-CSV")}}</a>
                <a class="button is-link" :href="downloadURL('xls')">{{$t("download-excel")}}</a>
            </div>
        </div>

        <list-annotations-by-term v-for="term in termsOptions" :key="term.id"
            :size="selectedSize.size"
            :color="selectedColor.hexaCode"
            :nbPerPage="nbPerPage"

            :allTerms="terms"
            :allUsers="allUsers"
            :allImages="images"

            :term="term"
            :multipleTerms="term == multipleTermsOption"
            :noTerm="term == noTermOption"
            :imagesIds="selectedImagesIds"
            :usersIds="selectedUsersIds"
            :reviewed="reviewed"
            :reviewUsersIds="reviewUsersIds"

            :forceUpdate="forceUpdate"

            v-show="selectedTermsIds.includes(term.id)"

            @addTerm="addTerm"
            @update="forceUpdate = []"> <!-- assigning a new array will be considered as a change in children components -->
        </list-annotations-by-term>
    </div>
</div>
</template>

<script>
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import OntologyTreeMultiselect from "@/components/ontology/OntologyTreeMultiselect";

import ListAnnotationsByTerm from "./ListAnnotationsByTerm";

import {ImageInstanceCollection, TermCollection, UserCollection, UserJobCollection, AnnotationCollection} from "cytomine-client";

import {fullName} from "@/utils/user-utils.js";
import {defaultColors} from "@/utils/style-utils.js";

export default {
    name: "list-annotations",
    components: {
        CytomineMultiselect,
        OntologyTreeMultiselect,
        ListAnnotationsByTerm
    },
    data() {
        return {
            loading: true,
            error: false,
            forceUpdate: [],
            users: [],

            allowedSizes: [],
            selectedSize: null,
            nbPerPage: 25,

            userAnnotationOption: this.$t("user-annotations"),
            jobAnnotationOption: this.$t("analysis-annotations"),
            reviewedAnnotationOption: this.$t("reviewed-annotations"),
            annotationTypes: [],
            selectedAnnotationType : "",

            images: [],
            selectedImages: [],

            terms: [],
            noTermOption: {id: 0, name: this.$t("no-term")},
            multipleTermsOption: {id: -1, name: this.$t("multiple-terms")},
            selectedTermsIds: [],

            members: [],
            selectedMembers: [],
            
            userJobs: [],
            selectedUserJobs: [],

            selectedColor: null
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        ontology() {
            return this.$store.state.project.ontology;
        },
        configUI() {
            return this.$store.state.project.configUI;
        },
        selectedImagesIds() {
            return this.selectedImages.map(img => img.id);
        },
        reviewed() {
            return this.selectedAnnotationType == this.reviewedAnnotationOption;
        },
        selectedUsersIds() {
            if(this.reviewed) {
                return null;
            }
            let users = (this.selectedAnnotationType == this.jobAnnotationOption) ? this.selectedUserJobs 
                : this.selectedMembers;
            return users.map(user => user.id);
        },
        reviewUsersIds() {
            return this.reviewed ? this.selectedMembers.map(u => u.id) : null;
        },
        allUsers() {
            return this.users.concat(this.userJobs);
        },
        collection() {
            return new AnnotationCollection({
                project: this.project.id,
                terms: this.selectedTermsIds,
                images: this.selectedImagesIds,
                users: this.selectedUsersIds,
                reviewed: this.reviewed,
                reviewUsers: this.reviewUsersIds,
                noTerm: this.selectedTermsIds.includes(this.noTermOption.id),
                multipleTerms: this.selectedTermsIds.includes(this.multipleTermsOption.id)
            });
        },
        additionalNodes() {
            let additionalNodes = [this.noTermOption];
            if(this.terms.length > 1) {
                additionalNodes.push(this.multipleTermsOption);
            }
            return additionalNodes;
        },
        termsOptions() {
            return this.terms.concat(this.additionalNodes);
        },
        colors() {
            let colors = defaultColors.map(color => ({label: this.$t(color.name), ...color}));
            colors.push({label: this.$t("no-outline")});
            return colors;
        }
    },
    methods: {
        async fetchTerms() {
            this.terms = (await TermCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.selectedTermsIds = this.termsOptions.map(term => term.id);
        },
        async fetchImages() {
            this.images = (await ImageInstanceCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.selectedImages = this.images;
        },
        async fetchUsers() {
            this.users = (await UserCollection.fetchAll()).array;
            this.users.forEach(user => {
                user.fullName = fullName(user);
            });
        },
        async fetchMembers() {
            this.members = (await this.project.fetchUsers()).array;
            this.members.forEach(member => {
                member.fullName = fullName(member);
            });
            this.selectedMembers = this.members;
        },
        async fetchUserJobs() {
            this.userJobs = (await UserJobCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.userJobs = this.userJobs.filter(uj => uj.id != null); // HACK because some returned jobs are empty objects
            this.userJobs.forEach(userJob => {
                userJob.fullName = fullName(userJob);
            });

            this.selectedUserJobs = this.userJobs;
        },
        downloadURL(format) {
            return this.collection.getDownloadURL(format);
        },
        addTerm(term) {
            this.terms.push(term);
            this.selectedTermsIds.push(term.id);
        }
    },
    async created() {
        this.annotationTypes = [this.userAnnotationOption, this.jobAnnotationOption, this.reviewedAnnotationOption];
        this.selectedAnnotationType = (this.$route.query.type == "algo") ? this.jobAnnotationOption
            : (this.$route.query.type == "reviewed") ? this.reviewedAnnotationOption : this.userAnnotationOption;

        this.allowedSizes = [
            {label: this.$t("small"), size: 85},
            {label: this.$t("medium"), size: 125},
            {label: this.$t("large"), size: 200},
            {label: this.$t("huge"), size: 400},
        ];
        this.selectedSize = this.allowedSizes[0];

        this.selectedColor = this.colors[0];

        try {
            await Promise.all([
                this.fetchTerms(),
                this.fetchImages(), 
                this.fetchUsers(),
                this.fetchMembers(),
                this.fetchUserJobs()
            ]);
        }
        catch(error) {
            this.error = true;
            return;
        }

        if(this.$route.query.image != null) {
            let queriedImage = this.images.find(image => image.id == this.$route.query.image);
            if(queriedImage != null) {
                this.selectedImages = [queriedImage];
            }
        }

        if(this.$route.query.userJob != null) {
            let queriedUserJob = this.userJobs.find(uj => uj.id == this.$route.query.userJob);
            if(queriedUserJob != null) {
                this.selectedAnnotationType = this.jobAnnotationOption;
                this.selectedUserJobs = [queriedUserJob];
            }
        }

        this.loading = false;
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}

.filters:not(:last-child) {
    margin-bottom: 20px;
}

.download-buttons {
    justify-content: right;
}
</style>
