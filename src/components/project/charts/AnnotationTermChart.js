import {Pie} from "vue-chartjs";

import {Cytomine} from "cytomine-client";

export default {
    name: "annotation-term-chart",
    extends: Pie,
    props: ["project"],
    async mounted () {
        // TODO: in js client
        let terms = (await Cytomine.instance.api.get(`project/${this.project.id}/stats/term.json`)).data.collection;

        this.renderChart({
            labels: terms.map(term => term.key),
            datasets: [
                {
                    data: terms.map(term => term.value),
                    backgroundColor: terms.map(term => term.color),
                }
            ]
        }, { 
            maintainAspectRatio: false,
        });
    }
};
