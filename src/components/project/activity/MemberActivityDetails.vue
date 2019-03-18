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

            <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
                <h2> {{ $t("error") }} </h2>
                <p> {{ $t("unexpected-error-info-message") }} </p>
            </b-message>

            <template v-else>
                <p class="last-update is-size-7 has-text-grey">
                    {{$t("data-last-updated-on", {time: $options.filters.moment(lastUpdate, "LTS")})}}
                </p>

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

                    <template v-slot:default="{row: connection}">
                        <b-table-column :label="$t('date')" field="created" sortable>
                            {{ Number(connection.created) | moment("ll LT") }}
                        </b-table-column>

                        <b-table-column :label="$t('duration')" field="time" sortable>
                            {{ connection.time | duration("humanize") }}
                            <span class="tag is-success" v-if="connection.online">{{$t("ongoing")}}</span>
                        </b-table-column>

                        <b-table-column :label="$t('number-viewed-images')" field="countViewedImages" centered sortable>
                            {{ connection.countViewedImages }}
                        </b-table-column>

                        <b-table-column :label="$t('number-annotation-creations')" field="countCreatedAnnotations" centered sortable>
                            {{ connection.countCreatedAnnotations }}
                        </b-table-column>
                    </template>

                    <template v-slot:empty>
                        <div class="content has-text-grey has-text-centered">
                            <p>{{$t("no-project-connection")}}</p>
                        </div>
                    </template>

                    <template v-slot:detail="{row: connection}">
                        <project-connection-details :connection="connection" :key="connection.id"></project-connection-details>
                    </template>

                    <template v-slot:footer>
                        <p class="has-text-centered">
                            <a class="button is-link" :href="connections.downloadURL" target="_self">
                                {{$t("button-export-as-csv")}}
                            </a>
                        </p>
                    </template>

                    <template v-slot:bottom-left>
                        <b-select v-model="connectionsPerPage" size="is-small">
                            <option value="10">10 {{$t("per-page")}}</option>
                            <option value="25">25 {{$t("per-page")}}</option>
                            <option value="50">50 {{$t("per-page")}}</option>
                            <option value="100">100 {{$t("per-page")}}</option>
                        </b-select>
                    </template>
                </b-table>

                <hr>

                <h2>{{$t("connections-chart")}}</h2>

                <div class="columns">
                    <div class="column is-narrow">
                        <b-field :label="$t('by')" horizontal>
                            <b-select size="is-small" v-model="period">
                                <option value="hour">{{$t("hour")}}</option>
                                <option value="day">{{$t("day")}}</option>
                                <option value="week">{{$t("week")}}</option>
                            </b-select>
                        </b-field>
                    </div>
                    <div class="column is-narrow">
                        <b-field :label="$t('from')" horizontal>
                            <cytomine-datepicker v-model="startDate" :resetButton="false" :maxDate="endDate || new Date()">
                            </cytomine-datepicker>
                        </b-field>
                    </div>
                    <div class="column is-narrow">
                        <b-field :label="$t('to')" horizontal>
                            <cytomine-datepicker v-model="endDate" :minDate="startDate" :maxDate="new Date()">
                            </cytomine-datepicker>
                        </b-field>
                    </div>
                </div>

                <div class="chart-container">
                    <last-connections-chart css-classes="chart"
                        :project="project.id"
                        :user="idUser"
                        :period="period"
                        :startDate="startDate.getTime()"
                        :endDate="endDate ? endDate.setHours(23, 59, 59, 999) : null"
                        :showDates="true"
                        :revision="chartRevision">
                    </last-connections-chart>
                </div>

                <hr>

                <h2>{{$t("detailed-image-consultations")}}</h2>

                <b-table :data="consultations.array" :paginated="true" :per-page="consultationsPerPage" pagination-size="is-small">

                    <template v-slot:default="{row: consultation}">
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

                    <template v-slot:empty>
                        <div class="content has-text-grey has-text-centered">
                            <p>{{$t("no-image-consultation")}}</p>
                        </div>
                    </template>

                    <template v-slot:footer>
                        <p class="has-text-centered">
                            <a class="button is-link" :href="consultations.downloadURL" target="_self">
                                {{$t("button-export-as-csv")}}
                            </a>
                        </p>
                    </template>

                    <template v-slot:bottom-left>
                        <b-select v-model="consultationsPerPage" size="is-small">
                            <option value="10">10 {{$t("per-page")}}</option>
                            <option value="25">25 {{$t("per-page")}}</option>
                            <option value="50">50 {{$t("per-page")}}</option>
                            <option value="100">100 {{$t("per-page")}}</option>
                        </b-select>
                    </template>
                </b-table>
            </template>
        </div>
    </div>
</div>
</template>

<script>
import {fullName} from "@/utils/user-utils.js";
import {User, ProjectConnectionCollection, ImageConsultationCollection} from "cytomine-client";

import CytomineDatepicker from "@/components/form/CytomineDatepicker";
import ProjectConnectionDetails from "@/components/project/ProjectConnectionDetails";
import LastConnectionsChart from "@/components/charts/LastConnectionsChart.js";

import constants from "@/utils/constants.js";

import moment from "moment";

export default {
    name: "user-activity",
    components: {
        CytomineDatepicker,
        ProjectConnectionDetails,
        LastConnectionsChart
    },
    data() {
        return {
            loading: true,
            error: false,
            user: null,
            resumeActivity: null,

            connections: null,
            connectionsPerPage: 10,

            consultations: null,
            consultationsPerPage: 10,

            lastUpdate: null,
            timeout: null,

            chartRevision: 0,
            period: "day",
            startDate: moment().subtract(1, "month").toDate(),
            endDate: null
        };
    },
    computed: {
        idUser() {
            return Number(this.$route.params.idUser);
        },
        project() {
            return this.$store.state.project.project;
        }
    },
    methods: {
        async fetchData() {
            try {
                await Promise.all([
                    this.fetchUser(),
                    this.fetchResumeActivity(),
                    this.fetchConnections(),
                    this.fetchConsultations()
                ]);
            }
            catch(error) {
                console.log(error);
                this.error = true;
                return;
            }

            this.chartRevision++;
            this.lastUpdate = new Date();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.fetchData, constants.MEMBERS_ACTIVITY_REFRESH_INTERVAL);
        },
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
        await this.fetchData();
        this.loading = false;
    },
    destroyed() {
        clearTimeout(this.timeout);
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

.box {
    position: relative;
}

.last-update {
    position: absolute;
    top: 1.5em;
    right: 2em;
}

.tag {
    margin-left: 0.5em;
}

.chart-container {
    margin-top: 2em;
    height: 18em;
    position: relative;
}
</style>

<style lang="scss">
.user-activity-wrapper {
    .table-wrapper {
        margin-bottom: 0px;
    }

    .chart {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .field.is-horizontal {
        align-items: center;
    }

    .field-label {
        margin-right: 1em !important;
        padding-top: 0px !important;
    }
}
</style>
