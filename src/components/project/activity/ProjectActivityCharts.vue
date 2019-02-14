<template>
<div class="tile is-ancestor is-vertical project-activity-charts-wrapper">
    
    <div class="tile">
        <div class="tile is-parent">
            <div class="tile is-child box chart-box">
                <h2>{{$t("activity")}}</h2>
                <div class="chart-container big">
                    <activity-overview-chart css-classes="chart" 
                        :project="project" 
                        :startDate="startDate" 
                        :endDate="endDate"
                        :daysRange="daysRange" />
                </div>
            </div>
        </div>

        <div class="tile is-vertical single-metrics">
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{nbProjectVisits}}</strong>
                    <strong>{{$t("project-connections")}}</strong>  
                </div>
            </div>
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{nbImageConsultations}}</strong>
                    <strong>{{$t("image-consultations")}}</strong>    
                </div>
            </div>
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{nbAnnotationActions}}</strong>
                    <strong>{{$t("annotation-actions")}}</strong>    
                </div>
            </div>
        </div>
    </div>

    <div class="tile">
        <div class="tile is-vertical single-metrics">
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{ nbAnnotations[annotationTypes.USER] }}</strong>
                    <strong>{{$t("user-annotations")}}</strong>  
                </div>
            </div>
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{ nbAnnotations[annotationTypes.ALGO] }}</strong>
                    <strong>{{$t("job-annotations")}}</strong>    
                </div>
            </div>
            <div class="tile is-parent">
                <div class="tile is-child box single-metric">
                    <strong class="metric">{{ nbAnnotations[annotationTypes.REVIEWED] }}</strong>
                    <strong>{{$t("reviewed-annotations")}}</strong>    
                </div>
            </div>
        </div>

        <div class="tile is-parent">
            <div class="tile is-child box chart-box">
                <div class="columns">
                    <h2 class="column">{{$t("number-annotations")}}</h2>
                    <div class="column has-text-right">
                        <div class="filter-label">{{$t("term")}}</div>
                    </div>
                    <div class="column is-one-third">
                        <ontology-tree-multiselect 
                            :ontology="ontology"
                            :additionalNodes="[{id: 0, name: this.$t('all')}]"
                            :startWithAdditionalNodes="true"
                            :multiple="false"
                            v-model="selectedTerms" />
                    </div>
                </div>
                <div class="chart-container big">
                    <number-annotations-chart css-classes="chart" 
                        :project="project" 
                        :startDate="startDate"
                        :endDate="endDate" 
                        :term="selectedTerms[0]"
                        :daysRange="daysRange" />
                </div>
            </div>
        </div>
    </div>

    <div class="tile annotation-repartition">
        <div class="tile is-6 is-parent is-vertical">
            <div class="tile is-child box chart-box no-grow">
                <h2>{{$t("manual-annotations-vs-term")}}</h2>
                <div class="chart-container" :style="styleAnnotationTermChart">
                    <annotation-term-chart
                        css-classes="chart"
                        :project="project"
                        :startDate="startDate"
                        :endDate="endDate"
                        @nbElems="val => nbElemsAnnotationTermChart = val" />
                </div>
            </div>
        </div>
        <div class="tile is-6 is-parent is-vertical">
            <div class="tile is-child box chart-box no-grow">
                <h2>{{$t("manual-annotations-vs-contributor")}}</h2>
                <div class="chart-container" :style="styleAnnotationContributorChart">
                    <annotation-contributor-chart
                        css-classes="chart"
                        :project="project"
                        :startDate="startDate"
                        :endDate="endDate"
                        @nbElems="val => nbElemsAnnotationContributorChart = val" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import NumberAnnotationsChart from "./NumberAnnotationsChart.js";
import AnnotationTermChart from "./AnnotationTermChart.js";
import AnnotationContributorChart from "./AnnotationContributorChart.js";
import ActivityOverviewChart from "./ActivityOverviewChart.js";
import OntologyTreeMultiselect from "@/components/ontology/OntologyTreeMultiselect";

import {AnnotationType} from "cytomine-client";

export default {
    name: "project-activity-charts",
    props: [
        "startDate",
        "endDate"
    ],
    components: {
        NumberAnnotationsChart,
        AnnotationTermChart,
        AnnotationContributorChart,
        ActivityOverviewChart,
        OntologyTreeMultiselect
    },
    data() {
        return {
            loading: true,
            nbProjectVisits: 0,
            nbImageConsultations: 0,
            nbAnnotationActions: 0,
            nbAnnotations: {
                [AnnotationType.USER]: 0,
                [AnnotationType.ALGO]: 0,
                [AnnotationType.REVIEWED]: 0
            },
            selectedTerms: [0],
            nbElemsAnnotationTermChart: 0,
            nbElemsAnnotationContributorChart: 0
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        ontology() {
            return this.$store.state.project.ontology;
        },
        queryParams() {
            return {
                startDate: this.startDate,
                endDate: this.endDate
            };
        },
        annotationTypes() {
            return AnnotationType;
        },
        daysRange() { // duration of the intervals in evolution plots (depends on the length of the considered period)
            let dayDuration = 24*60*60*1000;
            let intervalDuration = (this.endDate || new Date().getTime()) - (this.startDate || this.project.created);

            if(intervalDuration > 365*2*dayDuration) {
                // large period => find a daysRange resulting in around 30 points
                return Math.round(intervalDuration / dayDuration / 30);
            }
            else if(intervalDuration > 365*dayDuration) {
                return 28;
            }
            else if(intervalDuration > 6*31*dayDuration) {
                return 14;
            }
            else if(intervalDuration > 31*dayDuration) {
                return 7;
            }
            else {
                return 1;
            }
        },
        styleAnnotationTermChart() {
            return {
                height: (30+this.nbElemsAnnotationTermChart*25) + "px"
            };
        },
        styleAnnotationContributorChart() {
            return {
                height: (30+this.nbElemsAnnotationContributorChart*25) + "px"
            };
        }
    },
    watch: {
        startDate() {
            this.loadData();
        },
        endDate() {
            this.loadData();
        }
    },
    methods: {
        async fetchNbConnections() {
            this.nbProjectVisits = await this.project.fetchNbConnections(this.queryParams);
        },
        async fetchNbImageConsultations() {
            this.nbImageConsultations = await this.project.fetchNbImageConsultations(this.queryParams);
        },
        async fetchNbAnnotationActions() {
            this.nbAnnotationActions = await this.project.fetchNbAnnotationActions(this.queryParams);
        },
        async fetchNbAnnotations(type) {
            this.nbAnnotations[type] = await this.project.fetchNbAnnotations({annotationType: type, ...this.queryParams});
        },
        async loadData() {
            await Promise.all([
                this.fetchNbConnections(),
                this.fetchNbImageConsultations(),
                this.fetchNbAnnotationActions(),
                this.fetchNbAnnotations(AnnotationType.USER),
                this.fetchNbAnnotations(AnnotationType.ALGO),
                this.fetchNbAnnotations(AnnotationType.REVIEWED)
            ]);
        }
    },
    async created() {
        await this.loadData();
        this.loading = false;
    }
};
</script>

<style scoped>
.single-metrics {
    flex-grow: 0;
    min-width: 250px;
}

.single-metric strong {
    display: block;
    text-align: center;
}

.single-metric .metric {
    font-size: 20px;
}

.chart-box {
    display: flex;
    flex-direction: column;
}

.chart-container {
    position: relative;
}

.no-grow {
    flex-grow: 0 !important;
}

.chart-container.big {
    min-height: 220px;
}

.columns {
    align-items: center;
}

.filter-label {
    margin-bottom: 0px !important;
}
</style>

<style>
.project-activity-charts-wrapper .chart {
    position: absolute;
    height: 100%;
    width: 100%;
}
</style>