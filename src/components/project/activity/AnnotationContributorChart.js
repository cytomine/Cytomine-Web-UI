import {HorizontalBar} from "vue-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";

export default {
    name: "annotation-contributor-chart",
    extends: HorizontalBar,
    props: [
        "project",
        "startDate",
        "endDate"
    ],
    data() {
        return {
            chartData: null
        };
    },
    computed: {
        queryParams() {
            return {
                startDate: this.startDate,
                endDate: this.endDate,
                leafsOnly: false
            };
        }
    },
    watch: {
        queryParams() {
            this.doRenderChart();
        }
    },
    methods: {
        async doRenderChart() {
            let contribs = await this.project.fetchStatsAnnotationCreators(this.queryParams);
            let data = contribs.map(c => c.value);
            this.$emit("nbElems", data.length);

            this.renderChart({
                labels: contribs.map(c => c.key),
                datasets: [
                    {
                        data,
                        backgroundColor: "#4480c4",
                        borderWidth: 0
                    }
                ]
            }, {
                maintainAspectRatio: false,
                legend: {display: false},
                scales: {
                    xAxes: [{
                        ticks: {
                            min: 0,
                            suggestedMax: Math.round(Math.max(...data)*1.2)+1
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            display: false
                        },
                        categoryPercentage: 0.6
                    }]
                }
            });
        }
    },
    async mounted () {
        this.addPlugin(ChartDataLabels);
        this.doRenderChart();
    }
};
