<template>
<div class="box error" v-if="!configUI['project-jobs-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div v-else class="list-algorithms-wrapper content-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading" class="panel">
        <p class="panel-heading">
            {{$t("algorithms")}}
            <button class="button is-link" @click="launchModal = true">
                {{$t('button-launch-new-algorithm')}}
            </button>
        </p>
        <div class="panel-block">
            <div class="filters">
                <h2>{{$t("filters")}}</h2>
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("software")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedSoftwares" :options="availableSoftwares" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("launcher")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedLaunchers" :options="availableLaunchers" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("execution-date")}}
                        </div>
                        <div class="filter-body">
                            <b-datepicker v-model="selectedDate" :placeholder="$t('all')" :max-date="new Date()"
                                        :month-names="moment.months()" :day-names="moment.weekdaysMin()"
                                        :date-formatter="date => moment(date).format('ll')" size="is-small">
                                <div class="has-text-centered">
                                    <button class="button is-small is-link" :disabled="selectedDate == null" @click="selectedDate = null">
                                        {{$t("button-reset")}}
                                    </button>
                                </div>
                            </b-datepicker>
                        </div>
                    </div>

                    <div class="column">
                        <div class="filter-label">
                            {{$t("status")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedStatus" :options="availableStatus"
                                label="label" track-by="status" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>
                </div>
            </div>

            <b-table :data="filteredJobs" class="table-algorithms" ref="table"
            :paginated="true" :per-page="perPage" pagination-size="is-small" detailed detail-key="id"
            default-sort="created" default-sort-direction="desc">

                <template slot-scope="{row: job}">
                    <b-table-column field="software" :label="$t('software')" sortable width="1000">
                        {{job.softwareName}}
                        <!-- {{$t("software-execution", {softwareName: job.softwareName, executionNumber: job.number})}} -->
                    </b-table-column>

                    <b-table-column :label="$t('run-number')" width="500" centered>
                        {{job.number}}
                    </b-table-column>

                    <b-table-column field="username" :label="$t('launched-by')" sortable width="1000">
                        {{ job.username }}
                    </b-table-column>

                    <b-table-column field="created" :label="$t('execution-date')" sortable width="1000">
                        {{ Number(job.created) | moment("ll LT") }}
                    </b-table-column>

                    <b-table-column field="status" :label="$t('status')" sortable centered width="1000">
                        <algorithm-status :status="job.status"></algorithm-status>
                    </b-table-column>
                </template>

                <template slot="detail" slot-scope="{row: job}">
                    <algorithm-details :key="job.id" :job="job" @update="props => job.populate(props)"></algorithm-details>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-algorithm-run")}}</p>
                    </div>
                </template>

                <template slot="bottom-left">
                    <b-select v-model="perPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>
        </div>
    </div>

    <launch-algorithm-modal :active.sync="launchModal" @add="addJob"></launch-algorithm-modal>
</div>
</template>

<script>
import {JobCollection} from "cytomine-client";
import AlgorithmStatus from "./AlgorithmStatus";
import AlgorithmDetails from "./AlgorithmDetails";
import LaunchAlgorithmModal from "./LaunchAlgorithmModal";
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import jobStatusLabelMapping from "@/utils/job-utils";
import moment from "moment";

export default {
    name: "list-algorithms",
    components: {
        AlgorithmStatus,
        AlgorithmDetails,
        LaunchAlgorithmModal,
        CytomineMultiselect
    },
    data() {
        return {
            loading: true,
            jobs: [],
            searchString: "",
            perPage: 10,
            launchModal: false,

            selectedSoftwares: [],
            selectedLaunchers: [],
            selectedDate: null,
            selectedStatus: [],
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        project() {
            return this.$store.state.project.project;
        },
        configUI() {
            return this.$store.state.project.configUI;
        },

        moment() {
            return moment;
        },

        availableSoftwares() {
            return [...new Set(this.jobs.map(job => job.softwareName))];
        },
        availableLaunchers() {
            return [...new Set(this.jobs.map(job => job.username))].filter(name => name); // TODO: remove filter (HACK to remove empty username)
        },
        availableStatus() {
            return Object.keys(jobStatusLabelMapping).map(key => {
                return {label: this.$t(jobStatusLabelMapping[key]), status: key};
            });
        },

        filteredJobs() {
            let selectedStatusValues = this.selectedStatus.map(obj => Number(obj.status));
            return this.jobs.filter(job => {
                let correctDate = this.selectedDate ? moment(Number(job.created)).isSame(this.selectedDate, "day") : true;
                return this.selectedSoftwares.includes(job.softwareName) &&
                    this.selectedLaunchers.includes(job.username) &&
                    correctDate &&
                    selectedStatusValues.includes(job.status);
            });
        },
    },
    methods: {
        addJob(job) {
            job.username = this.currentUser.username; // HACK because not correctly returned by core
            if(!this.availableSoftwares.includes(job.softwareName)) {
                this.selectedSoftwares.push(job.softwareName);
            }

            if(!this.availableLaunchers.includes(job.username)) {
                this.selectedLaunchers.push(job.username);
            }

            this.jobs.unshift(job);
            this.$refs.table.toggleDetails(job);
        }
    },
    async created() {
        this.jobs = (await JobCollection.fetchAll({project: this.project.id})).array;
        this.selectedSoftwares = this.availableSoftwares.slice();
        this.selectedLaunchers = this.availableLaunchers.slice();
        this.selectedStatus = this.availableStatus.slice();
        this.loading = false;
    }    
};
</script>

<style scoped>
.panel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filters {
    margin-bottom: 1.5em;
}
</style>

<style>
.list-algorithms-wrapper .datepicker .input {
    min-height: 40px;
    background-color: rgba(255, 255, 255, 0.75);
    border-radius: 5px;
    border: 1px solid #e8e8e8;
    font-size: 14px;
    font-family: inherit;
}

.list-algorithms-wrapper .datepicker .input::placeholder {
    color: black !important;
    opacity: 1;
    font-weight: 600;
}
</style>

