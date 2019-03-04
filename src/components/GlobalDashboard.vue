<template>
<div class="content-wrapper">
    <b-loading :is-full-page="false" :active.sync="loading"></b-loading>

    <template v-if="!loading">
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
                    <table class="table">
                        <tbody>
                            <tr>
                                <td class="stat-value">{{projects.length}}</td>
                                <td>{{$t("projects")}}</td>
                            </tr>
                            <tr>
                                <td class="stat-value">{{images.length}}</td>
                                <td>{{$t("images")}}</td>
                            </tr>
                            <tr>
                                <td class="stat-value">{{nbUserAnnots}}</td>
                                <td>{{$t("user-annotations")}}</td>
                            </tr>
                            <tr>
                                <td class="stat-value">{{nbJobAnnots}}</td>
                                <td>{{$t("job-annotations")}}</td>
                            </tr>
                            <tr>
                                <td class="stat-value">{{nbReviewed}}</td>
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

import {ImageInstanceCollection, ProjectCollection} from "cytomine-client";

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
            loading: true
        };
    },
    computed: {
        recentProjects() {
            let array = [];
            this.recentProjectsId.forEach(id => {
                let project = this.projects.find(project => project.id == id);
                if(project != null) {
                    array.push(project);
                }
            });
            return array;
        },
        lastOpenedImage() {
            if(this.recentImages && this.recentImages.length > 0) {
                let lastOpened = this.recentImages[0];
                let project = this.projects.find(project => project.id == lastOpened.project);
                lastOpened.projectName = project.name;
                return lastOpened;
            }
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },

    async created() {

        // Launch all requests in parallel
        let lightImagesPromise = ImageInstanceCollection.fetchAllLight();

        let nbUserAnnotsPromise = this.currentUser.fetchNbAnnotations();
        let nbReviewedPromise = this.currentUser.fetchNbAnnotations(true);
        // TODO: job annots

        let projectsPromise = ProjectCollection.fetchAll();

        async function fetchRecentProjectsId(nbRecent) {
            let listRecent = await ProjectCollection.fetchLastOpened(nbRecent);
            return listRecent.map(recent => recent.id);
        }

        let recentProjetsPromise = fetchRecentProjectsId(this.nbRecent);
        let recentImagesPromise = ImageInstanceCollection.fetchLastOpened({max: 1});

        // Retrieve the results of the requests
        this.images = await lightImagesPromise;
        this.nbUserAnnots = await nbUserAnnotsPromise;
        this.nbReviewed = await nbReviewedPromise;
        this.projects = (await projectsPromise).array;
        this.recentImages = await recentImagesPromise;
        this.recentProjectsId = await recentProjetsPromise;

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

.stats .table {
    width: 100%;
}

.stat-value {
    font-weight: 600;
    text-align: right;
    width: 25%;
}

.last-image {
    flex: 1;
}
</style>
