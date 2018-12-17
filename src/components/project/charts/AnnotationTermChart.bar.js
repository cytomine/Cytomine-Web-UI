import {Bar} from "vue-chartjs";

import {Cytomine} from "cytomine-client";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {asArray as hexToRgb} from "ol/color";

export default {
    name: "annotation-term-chart",
    extends: Bar,
    props: ["project"],
    data() {
        return {
            terms: []
        };
    },
    computed: {
        labels() {
            return [this.$t("no-term"), ...this.terms.map(term => term.key)];
        },
        data() {
            // TODO: no term value should be returned by backend (comutation below incorrect since one annot may 
            // have multiple terms)
            let nbNoTerm = this.project.numberOfAnnotations - this.terms.reduce((sum, {value}) => {
                return sum + value;
            }, 0);
            return [nbNoTerm, ...this.terms.map(term => term.value)];
        },
        rgbColors() {
            return [[220, 220, 220], ...this.terms.map(term => {
                return hexToRgb(term.color);
            })];
        },
        colors() {
            return this.rgbColors.map(([r, g, b]) => `rgba(${r}, ${g}, ${b}, 0.75)`);
        },
        borderColors() {
            return this.rgbColors.map(([r, g, b]) => {
                r = r*0.75;
                g = g*0.75;
                b = b*0.75;
                return `rgba(${r}, ${g}, ${b}, 0.8)`;
            });
        }
    },
    async mounted () {
        // TODO: in js client
        this.terms = (await Cytomine.instance.api.get(`project/${this.project.id}/stats/term.json`)).data.collection;
        
        this.addPlugin(ChartDataLabels);
        this.renderChart({
            labels: this.labels,
            datasets: [
                {
                    label: " Number",
                    data: this.data,
                    backgroundColor: this.colors,
                    borderColor: this.borderColors,
                    borderWidth: 1,
                    hoverBorderColor: this.borderColors,
                    hoverBorderWidth: 2
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
                        suggestedMax: Math.round(Math.max(...this.data)*1.1)
                    }
                }]
            }
        });
    }
};
