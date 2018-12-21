<template>
<div class="list-annotations-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading">
        <div class="box">
            <h2> {{ $t("filters") }} </h2>
            <div class="filters">
                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("annotation-type")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedAnnotationType" :options="annotationTypes"
                                    :allow-empty="false">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div v-if="selectedAnnotationType == userAnnotationOption" class="column filter">
                            <div class="filter-label">
                                {{$t("members")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedMembers" :options="members"
                                    label="fullName" track-by="id" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div v-else class="column filter">
                            <div class="filter-label">
                                {{$t("jobs")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedUserJobs" :options="userJobs" 
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
                                <cytomine-multiselect v-model="selectedTerms" :options="termsOptions"
                                    label="name" track-by="id" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                    </div>
                </div>
        </div>

        <!-- TODO: download buttons -->
        <!-- QUESTION: do we allow saving the filters? -->

        <list-annotations-by-term v-for="term in termsOptions" :key="term.id" 
            :allTerms="terms"
            :allUsers="allUsers"
            :allImages="images"

            :term="term"
            :multipleTerms="term == multipleTermsOption"
            :noTerm="term == noTermOption"
            :imagesIds="selectedImagesIds"
            :usersIds="selectedUsersIds"

            :forceUpdate="forceUpdate"

            v-show="selectedTerms.includes(term)"

            @update="forceUpdate = []"> <!-- assigning a new array will be considered as a change in children components -->
        </list-annotations-by-term>
    </div>
</div>
</template>

<script>
import CytomineMultiselect from "@/components/form/CytomineMultiselect";

import ListAnnotationsByTerm from "./ListAnnotationsByTerm";

import {ImageInstanceCollection, TermCollection, UserCollection, UserJobCollection} from "cytomine-client";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "list-annotations",
    components: {CytomineMultiselect, ListAnnotationsByTerm},
    data() {
        return {
            loading: true, 
            forceUpdate: [],
            users: [],

            userAnnotationOption: this.$t("user-annotations"),
            jobAnnotationOption: this.$t("job-annotations"),
            annotationTypes: [],
            selectedAnnotationType : "",

            images: [],
            selectedImages: [],

            terms: [],
            termsOptions: [],
            noTermOption: {id: 0, name: this.$t("no-term")},
            multipleTermsOption: {id: -1, name: this.$t("multiple-terms")},
            selectedTerms: [],

            members: [],
            selectedMembers: [],
            
            userJobs: [],
            selectedUserJobs: []
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        selectedImagesIds() {
            return this.selectedImages.map(img => img.id);
        },
        selectedUsersIds() {
            let users = (this.selectedAnnotationType == this.jobAnnotationOption) ? this.selectedUserJobs 
                : this.selectedMembers;
            return users.map(user => user.id);
        },
        allUsers() {
            return this.users.concat(this.userJobs);
        }
    },
    methods: {
        async fetchTerms() {
            this.terms = (await TermCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.termsOptions = this.terms.slice();
            if(this.terms.length > 1) {
                this.termsOptions.push(this.multipleTermsOption);
            }
            this.termsOptions.push(this.noTermOption);
            this.selectedTerms = this.termsOptions;
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
        }
    },
    async created() {
        this.annotationTypes = [this.userAnnotationOption, this.jobAnnotationOption];
        this.selectedAnnotationType = (this.$route.query.type == "algo") ? this.jobAnnotationOption
            : this.userAnnotationOption;


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
            this.$notify({type: "error", text: this.$t("notif-error-load-annotations-filters")});
        }
        this.loading = false;
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
}
</style>