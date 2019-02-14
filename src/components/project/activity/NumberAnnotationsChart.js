import {Bar} from "vue-chartjs";

import {AnnotationType} from "cytomine-client";

export default {
    name: "annotation-term-chart",
    extends: Bar,
    props: [
        "project",
        "term",
        "startDate",
        "endDate",
        "daysRange"
    ],
    data() {
        return {
            annotationsEvolution: {
                [AnnotationType.USER]: [],
                [AnnotationType.ALGO]: [],
                [AnnotationType.REVIEWED]: []
            },
            chartData: null
        };
    },
    computed: {
        locale() {
            return this.$i18n.locale;
        },
        queryParams() {
            return {
                daysRange: this.daysRange,
                startDate: this.startDate,
                endDate: this.endDate,
                accumulate: false,
                reverseOrder: false,
                term: this.term
            };
        }
    },
    watch: {
        async queryParams() {
            await this.fetchData();
            this.updateChart();
        },
        locale() {
            this.updateLabels();
            this.updateChart();
        }
    },
    methods: {
        async fetchAnnotationsEvolution(type) {
            this.annotationsEvolution[type] = await this.project.fetchAnnotationsEvolution({annotationType: type, ...this.queryParams});
        },
        async fetchData() {
            await Promise.all([
                this.fetchAnnotationsEvolution(AnnotationType.USER),
                this.fetchAnnotationsEvolution(AnnotationType.ALGO),
                this.fetchAnnotationsEvolution(AnnotationType.REVIEWED)
            ]);

            this.chartData.datasets[0].data = this.annotationsEvolution[AnnotationType.USER].map(item => item.size);
            this.chartData.datasets[1].data = this.annotationsEvolution[AnnotationType.ALGO].map(item => item.size);
            this.chartData.datasets[2].data = this.annotationsEvolution[AnnotationType.REVIEWED].map(item => item.size);
            this.updateLabels();
        },
        updateLabels() {
            this.chartData.labels = this.annotationsEvolution[AnnotationType.USER].map(item => {
                let moment = this.$options.filters.moment;
                return this.daysRange == 1 ? moment(Number(item.date), "ll")
                    : [moment(Number(item.date), "ll") + " - ",  moment(Number(item.endDate), "ll")];
            });
        },
        updateChart() {
            this.$data._chart.update();
        }
    },
    async mounted () {
        this.chartData = {
            labels: [],
            datasets: [
                {
                    label: this.$t("user-annotations"),
                    data: [],
                    backgroundColor: "#4480c4",
                    borderWidth: 0
                },
                {
                    label: this.$t("job-annotations"),
                    data: [],
                    backgroundColor: "#aaa",
                    borderWidth: 0
                },
                {
                    label: this.$t("reviewed-annotations"),
                    data: [],
                    backgroundColor: "#42ce77",
                    borderWidth: 0
                }
            ]
        };
        
        await this.fetchData();

        this.renderChart(this.chartData, { 
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0
                    }
                }],
                xAxes: [{
                    categoryPercentage: 0.6,
                    gridLines: {
                        display: false
                    }
                }]
            }
        });
    }
};