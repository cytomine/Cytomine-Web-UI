<template>
<div class="content-wrapper">
    <b-loading :is-full-page="false" :active.sync="loading"></b-loading>

    <template v-if="!loading">
        <div v-if="welcomeMessage" class="box" v-html="welcomeMessage"></div>

        <div class="columns">
            <div class="column is-two-thirds">
                <div class="box">
                    <h2> {{ $t("recently-opened") }} </h2>
                    <b-table :data="recentProjects">

                        <template slot-scope="{row: project}">
                            <b-table-column :label="$t('project')" width="100" centered>
                                <router-link class="project-name" :to="`/project/${project.id}`">
                                    {{ project.name }}
                                </router-link>
                            </b-table-column>

                            <b-table-column :label="$t('images')" width="400">
                                <list-images-preview :idProject="project.id"></list-images-preview>
                            </b-table-column>
                        </template>

                        <template slot="empty">
                            <div class="content has-text-grey has-text-centered">
                                <p>{{$t("no-recent-project")}}</p>
                            </div>
                        </template>
                    </b-table>

                    <p class="has-text-centered all-projects">
                        <router-link class="button is-link" to="/projects">{{$t("view-all-projects")}}</router-link>
                    </p>
                </div>
            </div>

            <div class="column right-column">
                <div class="box stats">
                    <h2> {{ $t("statistics") }} </h2>
                    <table class="table is-fullwidth">
                        <tbody>
                            <tr>
                                <td>{{projects.length}}</td>
                                <td>{{$t("projects")}}</td>
                            </tr>
                            <tr>
                                <td>{{images.length}}</td>
                                <td>{{$t("images")}}</td>
                            </tr>
                            <tr>
                                <td>{{nbUserAnnots}}</td>
                                <td>{{$t("user-annotations")}}</td>
                            </tr>
                            <tr>
                                <td>{{nbJobAnnots}}</td>
                                <td>{{$t("analysis-annotations")}}</td>
                            </tr>
                            <tr>
                                <td>{{nbReviewed}}</td>
                                <td>{{$t("reviewed-annotations")}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="box last-image">
                    <h2> {{ $t("last-opened-image") }} </h2>
                    <image-preview v-if="lastOpenedImage" :image="lastOpenedImage" 
                        :fullHeightCard="false" :showProject="true">
                    </image-preview>
                    <div class="has-text-grey has-text-centered" v-else>
                        {{$t("no-recent-image")}}
                    </div>
                </div>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import {mapState} from "vuex";

import ListImagesPreview from "@/components/image/ListImagesPreview";
import ImagePreview from "@/components/image/ImagePreview";

import {ImageInstanceCollection, ProjectCollection, Configuration} from "cytomine-client";

import constants from "@/utils/constants.js";

export default {
    name: "global-dashboard",
    components: {
        ListImagesPreview,
        ImagePreview
    },
    props: {
        nbRecent: {
            type: Number,
            default: 3
        }
    },
    data() {
        return {
            projects: [],
            recentProjectsId: [],
            images: [],
            recentImages: [],
            nbProjects: 0,
            nbUserAnnots: 0,
            nbJobAnnots: 0,
            nbReviewed: 0,
            welcomeMessage: null,
            loading: true
        };
    },
    computed: {
        recentProjects() {
            let array = [];
            this.recentProjectsId.forEach(id => {
                let project = this.projects.array.find(project => project.id == id);
                if(project != null) {
                    array.push(project);
                }
            });
            return array;
        },
        lastOpenedImage() {
            if(this.recentImages && this.recentImages.length > 0) {
                let lastOpened = this.recentImages[0];
                let project = this.projects.array.find(project => project.id == lastOpened.project);
                lastOpened.projectName = project.name;
                return lastOpened;
            }
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    methods: {
        async fetchImages() {
            this.images = await ImageInstanceCollection.fetchAllLight();
        },
        async fetchProjects() {
            this.projects = await ProjectCollection.fetchAll();
        },
        async fetchNbAnnots() {
            this.nbUserAnnots = await this.currentUser.fetchNbAnnotations();
        },
        async fetchNbReviewedAnnots() {
            this.nbReviewed = await this.currentUser.fetchNbAnnotations(true);
        },
        async fetchRecentProjectsId() {
            let listRecent = await ProjectCollection.fetchLastOpened(this.nbRecent);
            this.recentProjectsId = listRecent.map(recent => recent.id);
        },
        async fetchRecentImages() {
            this.recentImages = await ImageInstanceCollection.fetchLastOpened({max: 1});
        },
        async fetchWelcomeMessage() {
            try {
                this.welcomeMessage = (await Configuration.fetch(constants.CONFIG_KEY_WELCOME)).value;
            }
            catch(error) {
                // no welcome message defined
            }
        }
    },
    async created() {
        await Promise.all([
            this.fetchImages(),
            this.fetchProjects(),
            this.fetchNbAnnots(),
            this.fetchNbReviewedAnnots(),
            this.fetchRecentProjectsId(),
            this.fetchRecentImages(),
            this.fetchWelcomeMessage()
        ]);
        this.loading = false;
    }
};
</script>

<style scoped>
td {
    vertical-align: middle !important;
}

a.project-name {
    font-weight: 600;
    font-size: 16px;
}

.all-projects {
    margin-top: 10px;
}

.right-column {
    display: flex;
    flex-direction: column;
}

.stats {
    padding-bottom: 40px;
}

td:first-child {
    font-weight: 600;
    text-align: right;
    width: 25%;
}

.last-image {
    flex: 1;
}
</style>
