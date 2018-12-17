<!-- TODO translations -->
<template>
<div class="project-activity-wrapper">
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-9">

            <div class="tile single-metrics">
                <div class="tile is-parent">
                    <div class="tile is-child box single-metric">
                        <strong class="metric">X</strong> <!-- TODO -->
                        <strong>Project visits</strong>  
                    </div>
                </div>
                <div class="tile is-parent">
                    <div class="tile is-child box single-metric">
                        <strong class="metric">Y</strong> <!-- TODO -->
                        <strong>Image consultations</strong>    
                    </div>
                </div>
            </div>

            <div class="tile is-parent">
                <div class="tile is-child box chart-box">
                    <h2>Activity</h2>
                    <div class="chart-container">
                       <!-- TODO: graph of number of image consultations / annotation actions / other.. -->
                    </div>
                </div>
            </div>

            <div class="tile number-annotations">
                <div class="tile is-vertical single-metrics">
                    <div class="tile is-parent">
                        <div class="tile is-child box single-metric">
                            <strong class="metric">{{ project.numberOfAnnotations }}</strong>
                            <strong>{{$t("user-annotations")}}</strong>  
                        </div>
                    </div>
                    <div class="tile is-parent">
                        <div class="tile is-child box single-metric">
                            <strong class="metric">{{ project.numberOfJobAnnotations }}</strong>
                            <strong>{{$t("job-annotations")}}</strong>    
                        </div>
                    </div>
                    <div class="tile is-parent">
                        <div class="tile is-child box single-metric">
                            <strong class="metric">{{ project.numberOfReviewedAnnotations }}</strong>
                            <strong>{{$t("reviewed-annotations")}}</strong>    
                        </div>
                    </div>
                </div>

                <div class="tile is-parent">
                    <div class="tile is-child box chart-box number-annotations">
                        <h2>Number of annotations</h2>
                        <div class="chart-container">
                            <number-annotations-chart css-classes="chart" :project="project"></number-annotations-chart>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tile annotation-repartition">
                <div class="tile is-6 is-parent">
                    <div class="tile is-child box chart-box">
                        <h2>Manual annotation VS. term</h2>
                        <div class="chart-container">
                            <annotation-term-chart css-classes="chart" :project="project"></annotation-term-chart>
                        </div>
                    </div>
                </div>
                <div class="tile is-6 is-parent">
                    <div class="tile is-child box chart-box">
                        <h2>Manual annotation VS. contributor</h2>
                        <div class="chart-container">
                            <annotation-contributor-chart css-classes="chart" :project="project"></annotation-contributor-chart>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tile is-parent">
            <div class="tile is-child box last-actions">
                <h2>Last actions</h2>
                <select v-model="selectedUser">
                    <option :value="null">All users/algorithms</option>
                    <optgroup label="Members">
                        <option v-for="member in members" :value="member.id" :key="member.id">{{member.fullName}}</option>
                    </optgroup>
                    <optgroup label="Algorithms">
                        <option v-for="uJob in userJobs" :value="uJob.id" :key="uJob.id">{{uJob.fullName}}</option>
                    </optgroup>
                </select>
                
                <div class="list-actions">
                    <ul>
                        <li v-for="action in lastActions" :key="action.id">
                            <strong>{{Number(action.created) | moment("ll LTS")}}:</strong> {{action.message}}
                        </li>
                    </ul>

                    <button class="button" v-if="!loadedAllActions" @click="loadActions()">Load more</button>
                    <div class="has-text-centered" v-else>
                        <strong>Nothing more to load.</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {Cytomine, UserJobCollection} from "cytomine-client";

import NumberAnnotationsChart from "./charts/NumberAnnotationsChart.js";
import AnnotationTermChart from "./charts/AnnotationTermChart.bar.js";
import AnnotationContributorChart from "./charts/AnnotationContributorChart.js";

import {fullName} from "@/utils/user-utils.js";

export default {
    name: "project-activity",
    components: {
        NumberAnnotationsChart,
        AnnotationTermChart,
        AnnotationContributorChart
    },
    props: ["project"],
    data() {
        return {
            loading: true,
            offset: 0,
            nbActionsPerPage: 10,
            loadedAllActions: false,

            userJobs: [],
            members: [],
            selectedUser: null,

            lastActions: []
        };
    },
    watch: {
        selectedUser() {
            this.lastActions = [];
            this.offset = 0;
            this.loadedAllActions = false;
            this.loadActions();
        }
    },
    methods: {
        async loadActions() {
            // TODO in js client
            let {data} = await Cytomine.instance.api.get(`project/${this.project.id}/commandhistory.json`, {params: {
                max: this.nbActionsPerPage,
                offset: this.offset,
                user: this.selectedUser
            }});

            this.lastActions.push(...data);
            this.offset += this.nbActionsPerPage;

            if(data.length < this.nbActionsPerPage) {
                this.loadedAllActions = true;
            }
        },

        async fetchMembers() {
            this.members = (await this.project.fetchUsers()).array;
            this.members.forEach(member => member.fullName = fullName(member));
        },

        async fetchUserJobs() {
            this.userJobs = (await UserJobCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.userJobs = this.userJobs.filter(uj => uj.id != null); // HACK because some returned jobs are empty objects
            this.userJobs.forEach(uJob => uJob.fullName = fullName(uJob));
        }
    },
    async created() {
        await Promise.all([
            this.loadActions(),
            this.fetchMembers(),
            this.fetchUserJobs()
        ]);

        this.loading = false;
    }
};
</script>

<style scoped>
.project-activity-wrapper {
    padding: 20px 50px 20px 50px;
    height: 100%;
    position: relative;
}

.project-activity-wrapper h2 {
    font-size: 18px;
}

.single-metrics {
    flex-grow: 0;
    min-width: 250px;
}

.single-metric strong {
    display: block;
    text-align: center;
}

.single-metric .metric {
    font-size: 26px;
}

.is-ancestor {
    height: 100%;
}

.last-actions {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    word-wrap: break-word;
}

.list-actions {
    overflow: auto;
}

li {
    margin-bottom: 5px;
}

.button {
    display: block;
    margin: auto;
}

select {
    /* width: 100%; */
    
    width: 90%;
    margin: auto;
    margin-top: 0px;
    margin-bottom: 10px;
    flex-shrink: 0;
}

.chart-box {
    display: flex;
    flex-direction: column;
}

.chart-container {
    position: relative;
    flex-grow: 1;
    min-height: 100px;
}


.chart-box.number-annotations .chart-container {
    min-height: 200px;
}
</style>

<style>
.project-activity-wrapper .chart {
    position: absolute;
    height: 100%;
    width: 100%;
}
</style>