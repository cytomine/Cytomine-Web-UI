import {Bar} from "vue-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {Cytomine} from "cytomine-client";

export default {
    name: "annotation-contributor-chart",
    extends: Bar,
    props: ["project"],
    async mounted () {
        // TODO: in js client
        let contribs = (await Cytomine.instance.api.get(`project/${this.project.id}/stats/user.json`)).data.collection;
        let data = contribs.map(c => c.value);
        
        this.addPlugin(ChartDataLabels);
        this.renderChart({
            labels: contribs.map(c => c.key),
            datasets: [
                {
                    label: " Number",
                    data,
                    backgroundColor: "rgba(220, 220, 220, 0.75)",
                    borderColor: "rgba(165, 165, 165, 0.8)",
                    borderWidth: 1
                }
            ]
        }, {
            maintainAspectRatio: false,
            legend: {display: false},
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        suggestedMax: Math.round(Math.max(...data)*1.1)
                    }
                }]
            }
        });
    }
};
