import {Line} from "vue-chartjs";

import {Cytomine} from "cytomine-client";

export default {
    name: "annotation-term-chart",
    extends: Line,
    props: ["project"],
    async mounted () {
        let {data} = await Cytomine.instance.api.get(`project/${this.project.id}/stats/annotationevolution.json?daysRange=15`); // TODO in js client
        let manualCounts = data.collection.reverse();

        let algoCounts = manualCounts.map(count => count.size + Math.round((Math.random() - 0.5)*count.size)); // TODO in backend
        let reviewedCounts = manualCounts.map(count => Math.round(Math.random()*count.size)); // TODO in backend

        this.renderChart({
            labels: manualCounts.map(count => this.$options.filters.moment(count.date, "ll")),
            datasets: [
                {
                    label: "Manual annotations",
                    data: manualCounts.map(count => count.size),
                    backgroundColor: "rgba(161, 192, 228, 0.5)",
                    borderColor: "#4480c4",
                    pointBackgroundColor: "#4480c4",
                    borderWidth: 2
                },
                {
                    label: "Algo annotations",
                    data: algoCounts,
                    borderWidth: 2
                },
                {
                    label: "Reviewed annotations",
                    data: reviewedCounts,
                    borderWidth: 2,
                    backgroundColor: "rgb(174, 249, 191, 0.5)",
                    borderColor: "#42ce77",
                    pointBackgroundColor: "#42ce77",
                }
            ]
        }, { 
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        suggestedMax: Math.round(this.project.numberOfAnnotations*1.1)
                    }
                }]
            }
        });
    }
};