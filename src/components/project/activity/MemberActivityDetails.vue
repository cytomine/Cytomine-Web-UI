<template>
<div class="user-activity-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div class="content-wrapper" v-if="!loading">
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li><router-link :to="`/project/${project.id}`">{{project.name}}</router-link></li>
                <li><router-link :to="`/project/${project.id}/activity?tab=members`">{{$t("members-activity")}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">{{$t("activity-of-user", {username: user.fullName})}}</a></li>
            </ul>
        </nav>

        <div class="box">
            <h1>{{$t("activity-of-user", {username: user.fullName})}}</h1>

            <div class="level">
                <div class="level-item has-text-centered">
                    <div>
                    <p class="heading">{{$t("project-connections")}}</p>
                    <p class="title">{{resumeActivity.totalConnections}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                    <p class="heading">{{$t("image-consultations")}}</p>
                    <p class="title">{{resumeActivity.totalConsultations}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                    <p class="heading">{{$t("annotation-actions")}}</p>
                    <p class="title">{{resumeActivity.totalAnnotationActions}}</p>
                    </div>
                </div>
            </div>

            <hr>

            <h2>{{$t("detailed-project-connections")}}</h2>

            <b-table :data="connections.array" default-sort="created" default-sort-direction="desc"
                :paginated="true" :per-page="connectionsPerPage" pagination-size="is-small"
                detailed detail-key="id">

                <template slot-scope="{row: connection}">
                    <b-table-column :label="$t('date')" field="created" sortable>
                        {{ Number(connection.created) | moment("ll LT") }}
                    </b-table-column>

                    <b-table-column :label="$t('duration')" field="time" sortable>
                        {{ connection.time | duration("humanize") }}
                    </b-table-column>

                    <b-table-column :label="$t('number-viewed-images')" field="countViewedImages" centered sortable>
                        {{ connection.countViewedImages }}
                    </b-table-column>

                    <b-table-column :label="$t('number-annotation-creations')" field="countCreatedAnnotations" centered sortable>
                        {{ connection.countCreatedAnnotations }}
                    </b-table-column>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-project-connection")}}</p>
                    </div>
                </template>

                <template slot="detail" slot-scope="{row: connection}">
                    <project-connection-details :connection="connection"></project-connection-details>
                </template>

                <p class="has-text-centered" slot="footer">
                    <a class="button is-link" :href="connections.downloadURL" target="_self">{{$t("button-export-as-csv")}}</a>
                </p>

                <template slot="bottom-left">
                    <b-select v-model="connectionsPerPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>

            <hr>

            <!-- <h2>{{$t("average-connections")}}</h2> TODO

            <hr> -->

            <h2>{{$t("detailed-image-consultations")}}</h2>

            <b-table :data="consultations.array" :paginated="true" :per-page="consultationsPerPage" pagination-size="is-small">

                <template slot-scope="{row: consultation}">
                    <b-table-column :label="$t('overview')" field="created">
                        <router-link :to="`/project/${project.id}/image/${consultation.image}`">
                            <img :src="consultation.imageThumb" class="image-overview">
                        </router-link>
                    </b-table-column>

                    <b-table-column :label="$t('image')" field="imageName" sortable>
                        <router-link :to="`/project/${project.id}/image/${consultation.image}`">
                            {{ consultation.imageName }}
                        </router-link>
                    </b-table-column>

                    <b-table-column :label="$t('duration')" field="time" sortable>
                        {{ consultation.time | duration("humanize") }}
                    </b-table-column>

                     <b-table-column :label="$t('number-consultations')" field="frequency" centered sortable>
                        {{ consultation.frequency }}
                    </b-table-column>

                    <b-table-column :label="$t('first-consultation')" field="first" centered sortable>
                        {{ Number(consultation.first) | moment("ll LT")}}
                    </b-table-column>

                    <b-table-column :label="$t('last-consultation')" field="last" centered sortable>
                        {{ Number(consultation.last) | moment("ll LT")}}
                    </b-table-column>

                    <b-table-column :label="$t('number-annotation-creations')" field="countCreatedAnnotations" centered sortable>
                        {{ consultation.countCreatedAnnotations }}
                    </b-table-column>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-image-consultation")}}</p>
                    </div>
                </template>

                <p class="has-text-centered" slot="footer">
                    <a class="button is-link" :href="consultations.downloadURL" target="_self">{{$t("button-export-as-csv")}}</a>
                </p>

                <template slot="bottom-left">
                    <b-select v-model="consultationsPerPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>
        </div>
    </div>
</div>
</template>

<script>
// TODO: refresh interval (+ display last update date)
import {fullName} from "@/utils/user-utils.js";
import {User, ProjectConnectionCollection, ImageConsultationCollection} from "cytomine-client";
import ProjectConnectionDetails from "@/components/project/ProjectConnectionDetails";

export default {
    name: "user-activity",
    components: {ProjectConnectionDetails},
    data() {
        return {
            loading: true,
            user: null,
            resumeActivity: null,

            connections: null,
            connectionsPerPage: 10,

            consultations: null,
            consultationsPerPage: 10
        };
    },
    computed: {
        idUser() {
            return this.$route.params.idUser;
        },
        project() {
            return this.$store.state.project.project;
        }
    },
    methods: {
        async fetchUser() {
            await this.user.fetch();
            this.user.fullName = fullName(this.user);
        },
        async fetchResumeActivity() {
            this.resumeActivity = await this.user.fetchResumeActivity(this.project.id);
        },
        async fetchConnections() {
            this.connections = await ProjectConnectionCollection.fetchAll({project: this.project.id, user: this.idUser});
        },
        async fetchConsultations() {
            this.consultations = await ImageConsultationCollection.fetchAll({project: this.project.id, user: this.idUser, resume: true});
        }
    },
    async created() {
        this.user = new User({id: this.idUser});
        await Promise.all([
            this.fetchUser(),
            this.fetchResumeActivity(),
            this.fetchConnections(),
            this.fetchConsultations()
        ]);
        this.loading = false;
    }
};
</script>

<style scoped>
h1 {
    text-transform: unset;
    letter-spacing: unset;
    font-weight: 400;
    font-size: 22px;
    margin-bottom: 1rem;
}

.image-overview {
    max-height: 45px;
    max-width: 128px;
}
</style>

<style>
.user-activity-wrapper .table-wrapper {
    margin-bottom: 0px;
}
</style>
